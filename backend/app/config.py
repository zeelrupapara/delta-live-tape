from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    delta_rest_url: str = "https://api.delta.exchange"
    delta_ws_url: str = "wss://socket.delta.exchange"
    symbols: str = "BTCUSD,ETHUSD"
    allowed_origin: str = "http://localhost:3000"

    @property
    def symbol_list(self) -> list[str]:
        return [s.strip().upper() for s in self.symbols.split(",") if s.strip()]


settings = Settings()
