console.log("Loading function");

const sharp = require("sharp");
const aws = require("aws-sdk");

const s3 = new aws.S3();

const transforms = [
  { name: "w_200", width: 200 },
  { name: "w_400", width: 400 },
  { name: "w_600", width: 600 },
];

exports.handler = async (event, context, callback) => {
  // Get the object from the event and show its content type
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
  const params = {
    Bucket: bucket,
    Key: key,
  };
  const filename = parts[parts.length - 1];

  try {
    const image = await s3.getObject(params).promise();

    await Promise.all(
      transforms.map(async (item) => {
        const resizedImage = await sharp(image.Body).resize({ width: item.width }).toBuffer();
        return await s3
          .putObject({
            Bucket: bucket,
            Body: resizedImage,
            Key: `images/${item.name}/${filename}`,
          })
          .promise();
      })
    );
    callback(null, `Success: ${filename}`);
  } catch (err) {
    callback(`Error resizing files: ${err}`);
  }
};
