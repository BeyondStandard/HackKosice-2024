from fastapi import FastAPI, HTTPException
import requests

app = FastAPI()

@app.post("/get-file/")
async def get_file(repo_url: str, file_path: str):
    # Construct the raw content URL for GitHub
    # This needs to be adjusted based on the repository hosting service
    raw_url = f"https://raw.githubusercontent.com/{repo_url}/{file_path}"

    # Fetch the file content
    response = requests.get(raw_url)
    if response.status_code == 200:
        # Return the file content
        # You might want to return the content type as well depending on the file
        return response.content
    else:
        raise HTTPException(status_code=404, detail="File not found")


# Example usage with curl from the terminal:
# curl -X 'POST' \
#   'http://127.0.0.1:8000/get-file/' \
#   -H 'accept: application/json' \
#   -H 'Content-Type: application/json' \
#   -d '{
#   "repo_url": "user/repo/branch",
#   "file_path": "path/to/file"
# }'

