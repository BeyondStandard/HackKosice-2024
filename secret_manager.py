from google.cloud import secretmanager
from os import environ


class SecretManager:
    def __init__(self):
        self.client = secretmanager.SecretManagerServiceClient()
        self.project_id = environ.get("PROJECT_ID")
        self.secrets = {}

    def init_secret(self, secret_name):
        if secret_name in self.secrets:
            return

        request_url = f"projects/{self.project_id}/secrets/{secret_name}/versions/latest"
        response = self.client.access_secret_version(request={"name": request_url})
        self.secrets[secret_name] = response.payload.data.decode("UTF-8")

    def set_secret(self, secret_key, secret_name):
        environ[secret_key] = self.secrets[secret_name]

    def get_secret(self, secret_name):
        return self.secrets[secret_name]
