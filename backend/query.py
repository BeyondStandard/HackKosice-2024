from langchain.chains.retrieval_qa.base import RetrievalQA
from langchain_community.vectorstores import Chroma
from langchain.prompts.prompt import PromptTemplate
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

import asyncio
import logging
import dotenv
import typing
import uuid
import os

import prompt_constants

# Langchain environment variables
dotenv.load_dotenv()
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_PROJECT"] = f"Tracing - {uuid.uuid4().hex[:8]}"
os.environ["LANGCHAIN_ENDPOINT"] = "https://api.smith.langchain.com"

# Logger constants
LOGGER_DATE_FORMAT: typing.Final[str] = "%H:%M:%S"
LOGGER_FORMAT: typing.Final[str] = (
    "%(asctime)s.%(msecs)03d | [%(lineno)3s] %(levelname)-9s| %(message)s"
)
FILE_LOGGER_FORMATTER = logging.Formatter(LOGGER_FORMAT, LOGGER_DATE_FORMAT)
FILE_LOGGER_NAME: typing.Final[str] = "log_file.log"
FILE_LOGGER_LEVEL: typing.Final[int] = logging.DEBUG

# Set up file logging
file_handler = logging.FileHandler(FILE_LOGGER_NAME, mode="w")
file_handler.setFormatter(FILE_LOGGER_FORMATTER)
file_handler.setLevel(FILE_LOGGER_LEVEL)

# Set up logging
logger = logging.getLogger()
logger.addHandler(file_handler)


class GPTChatter:
    def __init__(self):
        self.complete = None

        prompt = PromptTemplate(
            template=prompt_constants.PROMPT_TEMPLATE_EN,
            input_variables=["context", "question"],
        )
        vectordb = Chroma(
            persist_directory="../tmp/data/vectordb",
            embedding_function=OpenAIEmbeddings(
                model="text-embedding-3-small"),
        )
        r = vectordb.as_retriever(search_kwargs={"k": 10})
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=ChatOpenAI(
                streaming=True,
                temperature=0,
                max_tokens=4096,
                model="gpt-3.5-turbo-0125",
                openai_api_key=os.environ["OPENAI_API_KEY"],
            ),
            retriever=r,
            chain_type_kwargs={"prompt": prompt},
        )

    def _ask(self, message: str) -> dict[str, typing.Any]:
        return self.qa_chain.invoke({"query": message})

    async def _response(self):
        while not self.complete:
            if token := self.callback.request_token():
                yield token

            else:
                await asyncio.sleep(0)

    async def ask(self, message: str) -> dict[str, typing.Any]:
        self.complete = False
        loop = asyncio.get_running_loop()
        result = await loop.run_in_executor(None, self._ask, message)

        self.complete = True
        return result

    async def response(self):
        async for item in self._response():
            yield item


async def get_response(query="Rewrite identically in Python"):
    chatter2 = GPTChatter()
    response2 = await chatter2.ask(query)
    return response2


if __name__ == "__main__":
    chatter = GPTChatter()
    response = asyncio.run(chatter.ask("Rewrite identically in Python"))

    for key, value in response.items():
        logger.info(f"{key}: {value}")
        print(f"{key}: {value}")

