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

    public void placePiece(Board board, int x, int y) {
        System.out.println("Out");
        if (Rules.canPlace(board, x, y)) {
            System.out.println("in");
            Piece p = new Piece(this.colour, x, y);
            board.getBoardMatrix()[x][y] = p;
        }
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
}
