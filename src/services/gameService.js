import * as signalR from '@microsoft/signalr';

class GameService {
    constructor() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5000/gameHub')
            .withAutomaticReconnect()
            .build();

        this.connection.onclose(() => {
            console.log('SignalR bağlantısı kapandı');
        });
    }

    async start() {
        try {
            await this.connection.start();
            console.log('SignalR bağlantısı kuruldu');
        } catch (err) {
            console.error('SignalR bağlantısı kurulamadı:', err);
            setTimeout(() => this.start(), 5000);
        }
    }

    // Oyun olaylarını dinleme
    onGameCreated(callback) {
        this.connection.on('GameCreated', callback);
    }

    onPlayerJoined(callback) {
        this.connection.on('PlayerJoined', callback);
    }

    onGameStateUpdated(callback) {
        this.connection.on('GameStateUpdated', callback);
    }

    onError(callback) {
        this.connection.on('Error', callback);
    }

    onStoneDrawn(callback) {
        this.connection.on('StoneDrawn', callback);
    }

    onPlayerDrewStone(callback) {
        this.connection.on('PlayerDrewStone', callback);
    }

    onStoneThrown(callback) {
        this.connection.on('StoneThrown', callback);
    }

    onPerOpened(callback) {
        this.connection.on('PerOpened', callback);
    }

    // Oyun komutları
    async createGame(playerName) {
        return await this.connection.invoke('CreateGame', playerName);
    }

    async joinGame(gameId, playerName) {
        return await this.connection.invoke('JoinGame', gameId, playerName);
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