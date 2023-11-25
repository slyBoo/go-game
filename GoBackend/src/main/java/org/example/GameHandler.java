package org.example;

import jakarta.websocket.Session;

import java.io.IOException;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Queue;


public class GameHandler {
    static HashMap<String, Game> gameDict = new HashMap<>();
    static Queue<Player> playerQ = new LinkedList<>();

    static public void startGame(Player p1, Player p2) throws IOException {
        Game newGame = new Game(p1, p2);
        GameHandler.gameDict.put(p1.getSession().getId(), newGame);
        GameHandler.gameDict.put(p2.getSession().getId(), newGame);
        System.out.printf("Game with the id: %s has been added\n", p1.getSession().getId() + '-' + p2.getSession().getId());
        p1.getSession().getBasicRemote().sendText("gs pn:1");
        p2.getSession().getBasicRemote().sendText("gs pn:2");
        p1.setColour(Colour.BLACK);
        p2.setColour(Colour.WHITE);
        p1.setBoard(newGame.getBoard());
        p2.setBoard(newGame.getBoard());
    }

    static public String makeMove(String msg, Session session) {
        Game game = GameHandler.gameDict.get(session.getId());
        Player player = game.getTurn();
        if (player.getSession().getId().equals(session.getId()))  {
            String[] parseMsg = msg.split(" ");
            player.placePiece(game.getBoard(), Integer.parseInt(parseMsg[1]), Integer.parseInt(parseMsg[2]));
            game.toggleTurn();
            Board.printMatrix(game.getBoard().getBoardMatrix());
            return String.format("Placed piece at x: %d and y: %d\n", Integer.parseInt(parseMsg[1]), Integer.parseInt(parseMsg[2]));
        } else {
            return "not your turn";
        }
    }
}
