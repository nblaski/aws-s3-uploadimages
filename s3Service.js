const { S3 } = require('aws-sdk');
const {S3Client, PutObjectCommand} = require('@aws-sdk/client-s3')
const uuid = require('uuid').v4;

// single file upload
// exports.s3Uploadv2 = async (file) => {
//     const s3 = new S3()

//     const param = {
//         Bucket: process.env.AWS_BUCKET_NAME,
//         Key: `uploads/${uuid()}-${file.originalname}`,
//         // Body = buffer
//         Body: file.buffer
//     };
//     return await s3.upload(param).promise();
// }

exports.s3Uploadv2 = async (files) => {
    const s3 = new S3();

    const params = files.map(file => {
        return {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `uploads/${uuid()}-${file.originalname}`,
            Body: file.buffer
        };
    })
    return await Promise.all(params.map(param => s3.upload(param).promise()))
}


// upload S3 version one file
// exports.s3Uploadv3 = async (file) => {
//     const s3client = new S3Client();

//     const param = {
//         Bucket: process.env.AWS_BUCKET_NAME,
//         Key: `uploads/${uuid()}-${file.originalname}`,
//         Body: file.buffer
//     };

//     // this returns a promise - could write const result = await s3client...
//     return s3client.send(new PutObjectCommand(param));
// }


// upload S3 version multiple files
exports.s3Uploadv3 = async (files) => {
    const s3client = new S3Client();

    const params = files.map((file) => {
        return {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `uploads/${uuid()}-${file.originalname}`,
            Body: file.buffer
        };
    });
    return await Promise.all(
        params.map((param) => s3client.send(new PutObjectCommand(param)))  
    );  
}