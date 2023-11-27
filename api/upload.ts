import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";

const s3 = new S3Client({
  region: process.env.C_AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.C_AWS_ACCESS_KEY as string,
    secretAccessKey: process.env.C_AWS_SECRET_KEY as string,
  },
});

const upload = multer({
  limits: {
    fileSize: 1024 * 1024 * 5,
    files: 1,
  },
  storage: multerS3({
    s3: s3,
    bucket: process.env.C_AWS_BUCKET_NAME as string,
    key: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
}).any();

export default async (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(500).send(err);
    } else if (err) {
      return res.status(500).send(err);
    }

    return res
      .status(200)
      .send(`https://${process.env.C_AWS_BUCKET_NAME}.s3.amazonaws.com/${req.files[0].originalname}`);
  });
};
