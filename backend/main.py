from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)



@app.get("/")
async def root():
    return {"message": "Hello World from FastAPI running on Heroku!"}


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


"""
# Example usage with curl from the terminal:

 curl -X 'POST' \
   'http://http://televate-1fb46ecbb8ff.herokuapp.com:5000/get-file/' \
   -H 'accept: application/json' \
   -H 'Content-Type: application/json' \
   -d '{
   "repo_url": "justusjb/streamlit_workshop/main",
   "file_path": "main.py"
 }'
"""
