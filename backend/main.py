from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
from typing import List
import os
from pydantic import BaseModel
import time

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
    print("Response content: ", response.content)

    if response.status_code == 200:
        # Return the file content
        # You might want to return the content type as well depending on the file
        return response.content
    else:
        raise HTTPException(status_code=404, detail="File not found")


@app.get("/get-repo-structure/")
async def get_repo_structure(repo_url: str):
    # Construct the GitHub API URL for getting repo contents
    # Adjust based on the structure of 'repo_url' you expect
    # api_url = f"https://api.github.com/repos/{repo_url}/contents/"
    api_url = f"https://api.github.com/repos/{repo_url}/git/trees/main?recursive=1"

    response = requests.get(api_url, headers=get_github_token_header())
    print("Response status code: ", response.status_code)
    print("Response content: ", response.content)
    if response.status_code == 200:
        repo_structure = response.json()
        # Filter out only relevant information to minimize bandwidth and processing
        simplified_structure = [{"name": item["name"], "path": item["path"], "type": item["type"]} for item in repo_structure]
        return simplified_structure
    else:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch repository structure")


@app.get("/get-directory-contents/")
async def get_directory_contents(repo_url: str, dir_path: str):
    # Construct the GitHub API URL for getting the contents of the directory
    api_url = f"https://api.github.com/repos/{repo_url}/contents/{dir_path}"

    response = requests.get(api_url, headers=get_github_token_header())
    print("Response status code: ", response.status_code)
    print("Response content: ", response.content)
    if response.status_code == 200:
        directory_structure = response.json()
        directory_contents = [{"name": item["name"], "path": item["path"], "type": item["type"]} for item in directory_structure]
        return directory_contents
    else:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch directory contents")



@app.post("/new-code/")
async def get_new_code(code: Code):
    time.sleep(3)
    long_code = """
    import streamlit as st
    import pandas as pd
    import numpy as np
    
    st.title('Uber pickups in NYC')
    
    DATE_COLUMN = 'date/time'
    DATA_URL = ('https://s3-us-west-2.amazonaws.com/'
                'streamlit-demo-data/uber-raw-data-sep14.csv.gz')
                
                @st.cache
                def load_data(nrows):
                    data = pd.read_csv(DATA_URL, nrows=nrows)
                    lowercase = lambda x: str(x).lower()
                    data.rename(lowercase, axis='columns', inplace=True)
                    data[DATE_COLUMN] = pd.to_datetime(data[DATE_COLUMN])
                    return data
                    
                    data_load_state = st.text('Loading data...')
                    data = load_data(10000)
                    data_load_state.text("Done! (using st.cache)")
                
                if st.checkbox('Show raw data'):
                    st.subheader('Raw data')
                    st.write(data)
                    
                    st.subheader('Number of pickups by hour')
                    hist_values = np.histogram(data[DATE_COLUMN].dt.hour, bins=24, range=(0,24))[0]
                    st.bar_chart(hist_values)
                    
                    # Some number in the range 0-23
                    hour_to_filter = st.slider('hour', 0, 23, 17)
                    filtered_data = data[data[DATE_COLUMN].dt.hour == hour_to_filter]
                    
                    st.subheader('Map of all pickups at %s:00' % hour_to_filter)
                    st.map(filtered_data)
                    
        """

    return long_code


@app.post("/code-description/")
async def get_new_code(code: Code):
    time.sleep(3)
    code_desc = """
    This code snippet is a Streamlit application that visualizes Uber pickups in NYC.
    It loads a dataset of Uber pickups in NYC and displays the raw data when a checkbox is checked.
    It also displays the number of pickups by hour in a bar chart and a map of all pickups at a selected hour.
    """

    return code_desc


