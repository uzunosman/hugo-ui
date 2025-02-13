import * as signalR from '@microsoft/signalr';

class GameService {
    constructor() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5000/gameHub')
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        this.isConnecting = false;

        this.connection.onclose(() => {
            console.log('SignalR bağlantısı kapandı');
            this.isConnecting = false;
        });

        this.connection.onreconnecting(() => {
            console.log('SignalR yeniden bağlanıyor...');
            this.isConnecting = true;
        });

        this.connection.onreconnected(() => {
            console.log('SignalR yeniden bağlandı');
            this.isConnecting = false;
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
            await this.connection.start();
            console.log('SignalR bağlantısı kuruldu');
            this.isConnecting = false;
        } catch (err) {
            console.error('SignalR bağlantısı kurulamadı:', err);
            this.isConnecting = false;
            // 5 saniye sonra tekrar dene
            setTimeout(() => this.start(), 5000);
        }
    }

    // Oyun olaylarını dinleme
    onGameCreated(callback) {
        this.connection.off("GameCreated");
        this.connection.on('GameCreated', callback);
    }

    onPlayerJoined(callback) {
        this.connection.off("PlayerJoined");
        this.connection.on('PlayerJoined', callback);
    }

    onGameStateUpdated(callback) {
        this.connection.off("GameStateUpdated");
        this.connection.on('GameStateUpdated', callback);
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
        return await this.connection.invoke('CreateGame', playerName);
    }

    async joinGame(gameId, playerName) {
        return await this.connection.invoke('JoinGame', gameId, playerName);
    }

    async startGame(gameId) {
        return await this.connection.invoke('StartGame', gameId);
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