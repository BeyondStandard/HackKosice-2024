from langchain_community.document_loaders.parsers.language.javascript import JavaScriptSegmenter
from langchain_community.document_loaders.parsers.language.typescript import TypeScriptSegmenter
from langchain_community.document_loaders.parsers.language.csharp import CSharpSegmenter
from langchain_community.document_loaders.parsers.language.kotlin import KotlinSegmenter
from langchain_community.document_loaders.parsers.language.python import PythonSegmenter
from langchain_community.document_loaders.parsers.language.cobol import CobolSegmenter
from langchain_community.document_loaders.parsers.language.scala import ScalaSegmenter
from langchain_community.document_loaders.parsers.language.java import JavaSegmenter
from langchain_community.document_loaders.parsers.language.perl import PerlSegmenter
from langchain_community.document_loaders.parsers.language.ruby import RubySegmenter
from langchain_community.document_loaders.parsers.language.rust import RustSegmenter
from langchain_community.document_loaders.parsers.language.cpp import CPPSegmenter
from langchain_community.document_loaders.parsers.language.lua import LuaSegmenter
from langchain_community.document_loaders.parsers.language.go import GoSegmenter
from langchain_community.document_loaders.parsers.language.c import CSegmenter
from langchain_community.document_loaders.parsers import LanguageParser
from langchain_community.document_loaders.generic import GenericLoader
from langchain_community.document_loaders.blob_loaders import Blob
from langchain_core.documents.base import Document
from langchain_text_splitters import Language

import pickle
import typing
import tqdm
import os


LANGUAGE_EXTENSIONS: typing.Dict[str, str] = {
    "py": "python",
    "js": "js",
    "cobol": "cobol",
    "c": "c",
    "cpp": "cpp",
    "cs": "csharp",
    "rb": "ruby",
    "scala": "scala",
    "rs": "rust",
    "go": "go",
    "kt": "kotlin",
    "lua": "lua",
    "pl": "perl",
    "ts": "ts",
    "java": "java",
}

LANGUAGE_SEGMENTERS: typing.Dict[str, typing.Any] = {
    "python": PythonSegmenter,
    "js": JavaScriptSegmenter,
    "cobol": CobolSegmenter,
    "c": CSegmenter,
    "cpp": CPPSegmenter,
    "csharp": CSharpSegmenter,
    "ruby": RubySegmenter,
    "rust": RustSegmenter,
    "scala": ScalaSegmenter,
    "go": GoSegmenter,
    "kotlin": KotlinSegmenter,
    "lua": LuaSegmenter,
    "perl": PerlSegmenter,
    "ts": TypeScriptSegmenter,
    "java": JavaSegmenter,
}


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



class CustomParser(LanguageParser):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def lazy_parse(self, blob: Blob) -> typing.Iterator[Document]:
        code = blob.as_string()

        language = self.language or (
            LANGUAGE_EXTENSIONS.get(blob.source.rsplit(".", 1)[-1])
            if isinstance(blob.source, str)
            else None
        )

        if language is None:
            yield Document(
                page_content=code,
                metadata={
                    "source": blob.source,
                },
            )
            return

        if self.parser_threshold >= len(code.splitlines()):
            yield Document(
                page_content=code,
                metadata={
                    "source": blob.source,
                    "language": language,
                },
            )
            return

        # noinspection PyAttributeOutsideInit
        self.Segmenter = LANGUAGE_SEGMENTERS[language]
        segmenter = self.Segmenter(blob.as_string())
        if not segmenter.is_valid():
            yield Document(
                page_content=code,
                metadata={
                    "source": blob.source,
                },
            )
            return

        for functions_classes in segmenter.extract_functions_classes():
            yield Document(
                page_content=functions_classes,
                metadata={
                    "source": blob.source,
                    "content_type": "functions_classes",
                    "language": language,
                },
            )
        yield Document(
            page_content=code,
            metadata={
                "source": blob.source,
                "language": language,
            },
        )


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
