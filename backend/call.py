import secret_manager


# Secret manager setup
secret_manager = secret_manager.SecretManager()
secret_manager.init_secret("OpenAI")
secret_manager.init_secret("LangChain")

# Langchain environment variables
secret_manager.set_secret("OPENAI_API_KEY", "OpenAI")
secret_manager.set_secret("LANGCHAIN_API_KEY", "LangChain")