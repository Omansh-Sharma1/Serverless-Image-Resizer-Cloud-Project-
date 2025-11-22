import requests

# --- Step 1: Call your SignerFunction API to get a presigned URL ---
api_gateway_url = "https://dk7rflfyrb.execute-api.us-east-1.amazonaws.com/prod/generate-upload-url?fileName=test-image.jpg"

print("Getting presigned URL from SignerFunction...")
response = requests.get(api_gateway_url)

print("Status code:", response.status_code)
print("Response text:", response.text)  # <- add this to see exactly what is returned

if response.status_code != 200:
    print("❌ Failed to get presigned URL:", response.text)
    exit(1)

data = response.json()
upload_url = data.get("upload_url")
if not upload_url:
    print("❌ No upload URL returned")
    exit(1)

print("✅ Presigned URL obtained")

# --- Step 2: Upload local image to S3 via presigned URL ---
file_path = "test-image.jpg"  # Your local image file
with open(file_path, "rb") as f:
    file_data = f.read()

print("Uploading image to S3...")
upload_response = requests.put(upload_url, data=file_data, headers={"Content-Type": "image/jpeg"})

if upload_response.status_code == 200:
    print("✅ Upload successful!")
else:
    print(f"❌ Upload failed: {upload_response.status_code} - {upload_response.text}")
    exit(1)

print("The image should now be in the Original Bucket.")
print("Check S3, then check Resized Bucket and DynamoDB for results.")
