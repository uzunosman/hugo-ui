import * as signalR from '@microsoft/signalr';

class GameService {
    constructor() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5000/gameHub')  // Backend'in çalıştığı adres
            .withAutomaticReconnect([0, 2000, 5000, 10000, null])
            .configureLogging(signalR.LogLevel.Information)
            .build();

        this.isConnecting = false;
        this._gameStateCallbacks = new Set();
        this._currentGameId = null;

        this.connection.onclose(() => {
            console.log('SignalR bağlantısı kapandı');
            this.isConnecting = false;
        });

        this.connection.onreconnecting(() => {
            console.log('SignalR yeniden bağlanıyor...');
            this.isConnecting = true;
        });

        this.connection.onreconnected(async () => {
            console.log('SignalR yeniden bağlandı');
            this.isConnecting = false;
            if (this._currentGameId) {
                await this.refreshGameState();
            }
        });
    }

    async start() {
        try {
            if (this.isConnecting) {
                console.log('Bağlantı zaten kurulmaya çalışılıyor...');
                return;
            }

            if (this.connection.state === signalR.HubConnectionState.Connected) {
                console.log('Bağlantı zaten kurulu.');
                return;
            }

            this.isConnecting = true;
            console.log('SignalR bağlantısı başlatılıyor...');
            await this.connection.start();
            console.log('SignalR bağlantısı kuruldu');
            this.isConnecting = false;
        } catch (err) {
            console.error('SignalR bağlantısı kurulamadı:', err);
            this.isConnecting = false;
            throw err;
        }
    }

    // Game state yönetimi
    async getGameState(gameId) {
        try {
            console.log('Game state alınıyor...');
            const state = await this.connection.invoke('GetGameState', gameId);
            console.log('Game state alındı:', state);
            return state;
        } catch (err) {
            console.error('Game state alınırken hata:', err);
            throw err;
        }
    }

    async refreshGameState() {
        if (this._currentGameId) {
            try {
                const state = await this.getGameState(this._currentGameId);
                this._gameStateCallbacks.forEach(callback => callback(state));
            } catch (err) {
                console.error('Game state yenilenirken hata:', err);
            }
        }
    }

    // Oyun olaylarını dinleme
    onGameCreated(callback) {
        this.connection.off("GameCreated");
        this.connection.on('GameCreated', (gameId) => {
            this._currentGameId = gameId;
            callback(gameId);
        });
    }

    onPlayerJoined(callback) {
        this.connection.off("PlayerJoined");
        this.connection.on('PlayerJoined', async (data) => {
            callback(data);
            // Oyuncu katıldığında game state'i güncelle
            await this.refreshGameState();
        });
    }

    onGameStateUpdated(callback) {
        this.connection.off("GameStateUpdated");
        this._gameStateCallbacks.add(callback);
        this.connection.on('GameStateUpdated', (state) => {
            console.log('Game state güncellendi:', state);
            callback(state);
        });
    }

    onError(callback) {
        this.connection.off("Error");
        this.connection.on('Error', callback);
    }

    onStoneDrawn(callback) {
        this.connection.off("StoneDrawn");
        this.connection.on('StoneDrawn', callback);
    }

    onPlayerDrewStone(callback) {
        this.connection.off("PlayerDrewStone");
        this.connection.on('PlayerDrewStone', callback);
    }

    onStoneThrown(callback) {
        this.connection.off("StoneThrown");
        this.connection.on('StoneThrown', callback);
    }

    onPerOpened(callback) {
        this.connection.off("PerOpened");
        this.connection.on('PerOpened', callback);
    }

    onGameStarted(callback) {
        this.connection.off("GameStarted");
        this.connection.on('GameStarted', callback);
    }

    // Oyun komutları
    async createGame(playerName) {
        const gameId = await this.connection.invoke('CreateGame', playerName);
        this._currentGameId = gameId;
        return gameId;
    }

    async joinGame(gameId, playerName) {
        if (this.connection.state !== signalR.HubConnectionState.Connected) {
            console.log('Bağlantı kuruluyor...');
            await this.start();
        }

        this._currentGameId = gameId;
        return await this.connection.invoke('JoinGame', gameId, playerName);
    }

    async startGame(roomId) {
        try {
            console.log('startGame çağrıldı - RoomId:', roomId);
            if (!this.connection) {
                throw new Error('SignalR bağlantısı bulunamadı');
            }

            if (this.connection.state !== signalR.HubConnectionState.Connected) {
                console.log('Bağlantı yeniden kuruluyor...');
                await this.start();
            }

            console.log('StartGame hub metodu çağrılıyor...');
            await this.connection.invoke('StartGame', roomId);
            console.log('StartGame başarıyla tamamlandı');
        } catch (error) {
            console.error('StartGame hatası:', error);
            throw error;
        }
    }

    async drawStone() {
        return await this.connection.invoke('DrawStone');
    }

    async throwStone(stone) {
        return await this.connection.invoke('ThrowStone', stone);
    }

    async openPer(stones) {
        return await this.connection.invoke('OpenPer', stones);
    }

    async addStoneToPer(stone, perId) {
        return await this.connection.invoke('AddStoneToPer', stone, perId);
    }
}

export const gameService = new GameService();

export const onGameStarted = (callback) => {
    gameService.connection.on("GameStarted", (gameState) => {
        if (gameState) {
            // Taşları sırala
            if (gameState.yourStones) {
                gameState.yourStones.sort((a, b) => {
                    if (a.color !== b.color) {
                        return a.color - b.color;
                    }
                    return a.number - b.number;
                });
            }
            callback(gameState);
        }
    });
}; 