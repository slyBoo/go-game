package org.example;

import jakarta.websocket.Session;

public class Player {
    private Colour colour;
    private int score;
    private final Session session;
    private Board board;
    public Player(Session session) {
        this.session = session;
        this.score = 0;
    }

    public boolean placePiece(Board board, int x, int y) {
        if (Rules.canPlace(board, x, y, this.colour)) {
            board.getBoardMatrix()[x][y].setColour(this.colour);
            return true;
        }
        return false;
    }

    public Session getSession() {
        return session;
    }

    public void setBoard(Board board) {
        this.board = board;
    }

    public Colour getColour() {
        return colour;
    }

    public void setColour(Colour colour) {
        this.colour = colour;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }
}

enum Colour {
    BLACK,
    WHITE,
    EMPTY,
}
