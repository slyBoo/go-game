package org.example;

public class Piece {
    private Colour colour;
    private int x;
    private int y;

    public Piece(Colour colour, int x, int y) {
        this.colour =  colour;
        this.x = x;
        this.y = y;
    }

    public Colour getColour() {
        return colour;
    }

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }
}
