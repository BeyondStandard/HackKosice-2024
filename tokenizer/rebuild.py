from langchain_community.vectorstores.chroma import Chroma
from langchain_text_splitters import CharacterTextSplitter
from langchain_openai import OpenAIEmbeddings

import dotenv
import sys
import os

import data

# Load environment variables
dotenv.load_dotenv()

if __name__ == "__main__":
    data = data.Data(sys.argv[1])
    data.load_from_pickle()

    documents = []
    text_splitter = CharacterTextSplitter(
        separator="\n\n", chunk_size=1000, chunk_overlap=200
    )

    documents.extend(text_splitter.split_documents(data.data))
    vectordb = Chroma.from_documents(
        documents,
        persist_directory="../data/vectordb",
        embedding=OpenAIEmbeddings(model=os.environ["embeddingModel"]),
    )
    vectordb.persist()
