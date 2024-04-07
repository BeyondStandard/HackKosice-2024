from langchain_community.vectorstores.chroma import Chroma
from langchain_text_splitters import CharacterTextSplitter
from langchain_openai import OpenAIEmbeddings

import dotenv
import os
import sys

import databackend

# Load environment variables
dotenv.load_dotenv()

if __name__ == "__main__":

    if len(sys.argv) <= 1:
        raise ValueError("No arguments were provided. Please pass at least one argument.")

    data = databackend.Data(repo_path=sys.argv[1])
    data.load_from_pickle()

    documents = []
    text_splitter = CharacterTextSplitter(
        separator="\n\n", chunk_size=1000, chunk_overlap=200
    )

    documents.extend(text_splitter.split_documents(data.data))
    print(documents)
    vectordb = Chroma.from_documents(
        documents,
        persist_directory="../tmp/data/vectordb",
        embedding=OpenAIEmbeddings(model="text-embedding-3-small"),
    )
    vectordb.persist()
