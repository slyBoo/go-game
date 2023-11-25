package org.example;

import java.io.IOException;

public class Game {
    private final Player p1;
    private final Player p2;
    boolean turn;  // true for p1 false for p2
    Board board;
    public Game(Player player1, Player player2) {
        this.p1 = player1;
        this.p2 = player2;
        this.board = new Board();
        this.turn = true;
    }
    public Player getP1() {
        return p1;
    }

    public void sendAllClients(String msg) throws IOException {
        p1.getSession().getBasicRemote().sendText(msg);
        p2.getSession().getBasicRemote().sendText(msg);
    }
    public Player getTurn() {
        return turn ? p1 : p2;
    }

    public void toggleTurn() {
        turn = !turn;
    }
    public Player getP2() {
        return p2;
    }

    public Board getBoard() {
        return board;
    }
}