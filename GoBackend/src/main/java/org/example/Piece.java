package org.example;

import java.util.ArrayList;

public class Piece {
    private Colour colour;
    private int x;
    private int y;
    private Player player;

    public Piece(Colour colour, int x, int y) {
        this.colour =  colour;
        this.x = x;
        this.y = y;
    }

    public Player getPlayer() {
        return player;
    }

    public void setPlayer(Player player) {
        this.player = player;
    }

    public Colour getColour() {
        return colour;
    }

    public void setColour(Colour colour) {
        this.colour = colour;
    }

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

    public ArrayList<Piece> getNeighbours(Board board) {
        ArrayList<Piece> t = new ArrayList<>();
        if (y-1 >= 0) {
            t.add(board.getBoardMatrix()[x][y - 1]);
        }
        if (x+1 < Settings.getBoardDimensions()) {
            t.add(board.getBoardMatrix()[x + 1][y]);
        }
        if (y+1 < Settings.getBoardDimensions()) {
            t.add(board.getBoardMatrix()[x][y + 1]);
        }
        if (x-1 >= 0) {
            t.add(board.getBoardMatrix()[x - 1][y]);
        }
        return t;
    }

    @Override
    public String toString() {
        return String.format("%d,%d", this.x, this.y);
    }
}
