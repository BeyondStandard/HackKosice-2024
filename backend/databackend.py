from langchain_community.document_loaders.parsers import LanguageParser
from langchain_community.document_loaders.generic import GenericLoader
from langchain_core.documents.base import Document
from langchain_text_splitters import Language

import pickle
import typing
import tqdm
import os


class TqdmFileWrapper:
    def __init__(self, file, progress_bar):
        self._file = file
        self._progress_bar = progress_bar

    def read(self, size=-1):
        _data = self._file.read(size)
        self._progress_bar.update(len(_data))
        return _data

    def readline(self, size=-1):
        line = self._file.readline(size)
        self._progress_bar.update(len(line))
        return line

    # Add any other methods from the file object you might need
    def close(self):
        self._file.close()


class Data:
    PICKLE_PATH: typing.Final[str] = "../data/data.pickle"
    #REP_PATH: typing.Final[str] = None
    BINARY_EXCLUDES: typing.Final[typing.Sequence[str]] = (
        "*.gif",
        "*.png",
        "*.jpg",
        "*.jpeg",
        "*.pdf",
        "*.zip",
        "*.tar",
        "*.gz",
        "*.7z",
        "*.rar",
    )

    def __init__(self, repo_path) -> None:
        self.data = None
        self.REP_PATH = '../repositories/' + repo_path.split('/')[-1]

    @property
    def data(self) -> typing.List[Document]:
        return self._data

    @data.setter
    def data(self, value):
        self._data = value

    def load_from_repository(self) -> None:
        loader = GenericLoader.from_filesystem(
            self.REP_PATH,
            glob="*",
            # exclude=Data.BINARY_EXCLUDES,
            suffixes=[".cbl"],
            parser=LanguageParser(language=Language.COBOL),
        )

        self.data = loader.load()

    def load_from_pickle(self, file_path=PICKLE_PATH):
        file_size = os.path.getsize(file_path)
        with (
            open(file_path, "rb") as f,
            tqdm.tqdm(total=file_size, unit_scale=True) as pbar,
        ):
            wrapped_file = TqdmFileWrapper(f, pbar)
            self.data = pickle.load(wrapped_file)

    def export_data(self):
        # Create the data directory if it doesn't exist
        os.makedirs("../data", exist_ok=True)

        with open(Data.PICKLE_PATH, "wb") as f:
            pickle.dump(self.data, f)
