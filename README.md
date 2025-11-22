# Serverless Image Processing Pipeline with AWS Lambda

A fully serverless image processing workflow built using AWS services. This project demonstrates an end-to-end pipeline for uploading, resizing, and storing images without managing any servers.

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [AWS Services Used](#aws-services-used)
- [Setup Instructions](#setup-instructions)
- [Usage](#usage)
- [Security Considerations](#security-considerations)
- [Results](#results)
- [References](#references)
- [Contributing](#contributing)
- [License](#license)
- [Screenshots](#screenshots)

---

## Overview
This project uses AWS Lambda as the core compute engine to build a serverless image processing system. Users can upload images securely using presigned URLs, which trigger Lambda functions to resize the images. Processed images are stored in an S3 bucket, while metadata is logged in DynamoDB.

The pipeline is designed to be cost-efficient, scalable, and fully event-driven.

---

## Features
- Fully serverless: no servers to manage
- Event-driven architecture: S3 → Lambda
- Secure uploads using presigned URLs
- Image resizing using Pillow via Lambda Layers
- Metadata logging with DynamoDB
- Free-tier friendly

---

## Architecture

flowchart TD
    A[User] -->|Request Upload URL| B[API Gateway]
    B --> C[Signer Lambda]
    C -->|Presigned URL| A
    A -->|Upload Image| D[S3 Raw Bucket]
    D -->|Event Trigger| E[Resizer Lambda]
    E -->|Resized Image| F[S3 Resized Bucket]
    E -->|Metadata| G[DynamoDB]
Workflow:

Client requests a presigned URL via API Gateway.

Signer Lambda generates a unique URL for upload.

Image is uploaded to the raw S3 bucket.

S3 triggers Resizer Lambda to resize the image.

Processed images are stored in the output bucket.

Metadata is logged in DynamoDB.

## AWS Services Used
- AWS Lambda – Event-driven serverless compute
- Amazon S3 – Storage for raw and processed images
- Amazon API Gateway – REST endpoint for presigned URL generation
- Amazon DynamoDB – Metadata storage
- Lambda Layers (KLayers) – Pillow image processing library

## Setup Instructions
1. Create S3 Buckets
   - Raw images bucket (uploads via presigned URLs only)
   - Processed images bucket (for resized images)
2. Deploy Lambda Functions
   - Signer Lambda (generates presigned URLs)
   - Resizer Lambda (resizes images, logs metadata)
3. Configure API Gateway
   - Create GET /generate-upload-url endpoint
   - Integrate with Signer Lambda
4. Attach IAM Roles
   - Signer Lambda: s3:PutObject
   - Resizer Lambda: s3:GetObject, s3:PutObject, dynamodb:PutItem
5. Add Lambda Layer for Pillow
   - Use KLayers prebuilt Pillow layer

## Usage
1. Open the frontend (HTML + JS) or use any HTTP client.
2. Request a presigned URL via API Gateway.
3. Upload your image to the raw S3 bucket.
4. Wait for the Lambda function to process the image.
5. Access the resized image from the processed S3 bucket.
6. Metadata is automatically logged in DynamoDB.

## Security Considerations
- All uploads occur via presigned URLs; no AWS credentials are exposed.
- IAM policies follow the principle of least privilege.
- S3 buckets configured to avoid public write access.

## Results
- Fully automated serverless image resizing pipeline
- Fast processing (<300ms for most images)
- Free-tier compatible and scalable
- Clean, user-friendly frontend interface

## References

- AWS Lambda Documentation
- Amazon S3 Developer Guide
- AWS DynamoDB Best Practices
- KLayers GitHub Repository
- AWS Presigned URL Documentation

---

## Contributing
Contributions are welcome! If you find any issues or have suggestions for
