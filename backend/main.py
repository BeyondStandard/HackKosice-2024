from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import requests
from typing import List
import os
from pydantic import BaseModel
import time
import databackend
import query
import asyncio
import shutil
from openai import OpenAI
import prompt_constants
import httpx


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class Code(BaseModel):
    old_code: str


def get_github_token_header():
    github_token = os.getenv('GITHUB_TOKEN')
    headers = {
        "Authorization": f"Bearer {github_token}",
    }
    return headers


async def run_rebuild_script(repo_path):
    process = await asyncio.create_subprocess_shell(
        f"python3 rebuild.py {repo_path}",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )

    stdout, stderr = await process.communicate()  # Wait for the process to finish

    if stderr:
        print(f"Errors: {stderr.decode()}")

    print(f"Output: {stdout.decode()}")


@app.get("/")
async def root():
    return {"message": "Hello World from FastAPI running on Heroku!"}


@app.get("/get-file/")
async def get_file(repo_url: str, file_path: str, branch: str = "main"):
    """
    Construct the raw content URL for GitHub
    This needs to be adjusted based on the repository hosting service

    Example usage with curl from the terminal:

    curl -X 'POST' "http://televate-1fb46ecbb8ff.herokuapp.com/get-file/?repo_url=justusjb/streamlit_workshop/main&file_path=main.py"
    """
    raw_url = f"https://raw.githubusercontent.com/{repo_url}/{branch}/{file_path}"

    # Fetch the file content
    response = requests.get(raw_url, headers=get_github_token_header())

    print("Response status code: ", response.status_code)

    if response.status_code == 200:
        # Return the file content
        # You might want to return the content type as well depending on the file
        return response.content
    else:
        try:
            print("Trying with master branch...")
            raw_url = f"https://raw.githubusercontent.com/{repo_url}/master/{file_path}"
            response = requests.get(raw_url, headers=get_github_token_header())
            if response.status_code == 200:
                return response.content
        except:
            print("Error! Response content: ", response.content)
            raise HTTPException(status_code=response.status_code, detail="File not found")


@app.get("/get-repo-structure/")
async def get_repo_structure(repo_url: str):
    # Construct the GitHub API URL for getting repo contents
    # Adjust based on the structure of 'repo_url' you expect
    #api_url = f"https://api.github.com/repos/{repo_url}/contents/"
    api_url = f"https://api.github.com/repos/{repo_url}/git/trees/main?recursive=1"

    response = requests.get(api_url, headers=get_github_token_header())
    print("Response status code: ", response.status_code)
    if response.status_code == 200:
        repo_structure = response.json()
        # Filter out only relevant information to minimize bandwidth and processing
        # simplified_structure = [{"name": item["name"], "path": item["path"], "type": item["type"]} for item in repo_structure]
        return repo_structure
    else:
        try:
            api_url = f"https://api.github.com/repos/{repo_url}/git/trees/master?recursive=1"
            response = requests.get(api_url, headers=get_github_token_header())
            if response.status_code == 200:
                repo_structure = response.json()
                return repo_structure
        except:
            print("Error! Response content: ", response.content)
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch repository structure")


@app.get("/get-directory-contents/")
async def get_directory_contents(repo_url: str, dir_path: str):
    # Construct the GitHub API URL for getting the contents of the directory
    api_url = f"https://api.github.com/repos/{repo_url}/contents/{dir_path}"

    response = requests.get(api_url, headers=get_github_token_header())
    print("Response status code: ", response.status_code)
    if response.status_code == 200:
        directory_structure = response.json()
        directory_contents = [{"name": item["name"], "path": item["path"], "type": item["type"]} for item in directory_structure]
        return directory_contents
    else:
        print("Error! Response content: ", response.content)
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch directory contents")



@app.post("/new-code/")
async def get_new_code(repo_url: str, file_path: str):

    #repo_url="Jorengarenar/cobBF"

    data = databackend.Data(repo_path=repo_url)
    data.clone_repository()
    data.load_from_repository()

    # delete data
    try:
        shutil.rmtree("../tmp/data")
    except:
        pass

    # export data
    data.export_data()

    # rebuild
    await run_rebuild_script(repo_url)

    res = await query.get_response(
        f"Rewrite the file {file_path} identically in Python",
        prompt_constants.PROMPT_TEMPLATE_EN_TRANSLATE
    )
    return res


@app.post("/new-test/")
async def get_new_test(file_path: str):

    res = await query.get_response(
        f"Create test cases for the file {file_path}",
        prompt_constants.PROMPT_TEMPLATE_EN_TEST
    )
    return res


@app.post("/new-description/")
async def get_new_description(file_path: str):

    res = await query.get_response(
        f"Describe the file {file_path}",
        prompt_constants.PROMPT_TEMPLATE_EN_DESCRIBE
    )
    return res


@app.get("/getAccessToken")
async def get_access_token(code: str):
    params = {
        "client_id": os.getenv('CLIENT_ID'),
        "client_secret": os.getenv('CLIENT_SECRET'),
        "code": code,
    }
    async with httpx.AsyncClient() as client:
        response = await client.post("https://github.com/login/oauth/access_token", params=params, headers={"Accept": "application/json"})
        data = response.json()
        print(data)
        return JSONResponse(content=data)

@app.get("/getUserData")
async def get_user_data(request: Request):
    authorization = request.headers.get("Authorization")
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.github.com/user", headers={"Authorization": authorization})
        data = response.json()
        print(data)
        return JSONResponse(content=data)

