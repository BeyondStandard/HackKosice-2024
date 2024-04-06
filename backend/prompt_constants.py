import typing

PROMPT_EN: typing.Final[str] = (
    "Starting from now, you're a computer science expert. Given the following "
    "code, rewrite it so it has identical functionality in the "
    "language that is being asked for. Your response should be code and code "
    "only. Here's the code from github repository that you need to rewrite:"
    "\n\n"
)

PROMPT_TEMPLATE_EN: typing.Final[str] = (
    PROMPT_EN
    + """
{context}
-----
Request: {question}
Response: """
)