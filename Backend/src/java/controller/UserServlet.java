package controller;

import entity.User;
import util.HibernateUtil;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.exception.ConstraintViolationException;

public class UserServlet extends HttpServlet {
    @Override
    @SuppressWarnings("unchecked")
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json;charset=UTF-8");
        Session session = HibernateUtil.getSessionFactory().openSession();
        try {
            List<User> users = (List<User>) session.createQuery("from User").list();
            StringBuilder sb = new StringBuilder();
            sb.append('[');
            for (int i = 0; i < users.size(); i++) {
                User u = users.get(i);
                sb.append('{')
                        .append("\"id\":").append(u.getId()).append(',')
                        .append("\"username\":\"").append(escape(u.getUsername())).append("\"").append(',')
                        .append("\"email\":\"").append(escape(u.getEmail())).append("\"")
                        .append('}');
                if (i < users.size() - 1) sb.append(',');
            }
            sb.append(']');
            try (PrintWriter out = resp.getWriter()) {
                out.print(sb.toString());
            }
        } finally {
            session.close();
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String path = req.getPathInfo(); // e.g. /auth
        resp.setContentType("application/json;charset=UTF-8");
        // authentication endpoint: POST /api/users/auth with JSON { username, password }
        if (path != null && path.equals("/auth")) {
            String body = readRequestBody(req);
            String username = req.getParameter("username");
            String password = req.getParameter("password");
            if ((username == null || password == null) && body != null && body.length() > 0) {
                username = extractJsonString(body, "username");
                password = extractJsonString(body, "password");
            }
            if (username == null || password == null) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return;
            }
            Session session = HibernateUtil.getSessionFactory().openSession();
            try {
                List<User> users = (List<User>) session.createQuery("from User where username = :u")
                        .setParameter("u", username).list();
                if (users.isEmpty()) {
                    resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    try (PrintWriter out = resp.getWriter()) { out.print("{\"ok\":false}"); }
                    return;
                }
                User u = users.get(0);
                if (u.getPassword() != null && u.getPassword().equals(password)) {
                    try (PrintWriter out = resp.getWriter()) {
                        out.print("{\"id\":" + u.getId() + ",\"username\":\"" + escape(u.getUsername()) + "\",\"email\":\"" + escape(u.getEmail()) + "\"}");
                    }
                } else {
                    resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    try (PrintWriter out = resp.getWriter()) { out.print("{\"ok\":false}"); }
                }
            } finally {
                session.close();
            }
            return;
        }

        // fall back to existing create user behavior
        String username = req.getParameter("username");
        String password = req.getParameter("password");
        String email = req.getParameter("email");
        String body = readRequestBody(req);
        if ((username == null || username.isEmpty()) && body != null && body.length() > 0) {
            username = extractJsonString(body, "username");
            password = extractJsonString(body, "password");
            email = extractJsonString(body, "email");
        }
        if (username == null || username.isEmpty() || password == null || password.isEmpty()) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            try (PrintWriter out = resp.getWriter()) { out.print("{\"error\":\"username and password required\"}"); }
            return;
        }
        if (email == null || email.isEmpty()) {
            email = username + "@local";
        }
        Session session = HibernateUtil.getSessionFactory().openSession();
        try {
            Transaction tx = session.beginTransaction();
            User u = new User(username, password, email);
                try {
                    session.save(u);
                    tx.commit();
                    try (PrintWriter out = resp.getWriter()) {
                        out.print("{\"id\":" + u.getId() + ",\"username\":\"" + escape(u.getUsername()) + "\"}");
                    }
                } catch (Exception ex) {
                    tx.rollback();
                    // if this was a constraint violation (duplicate username), return 409 with helpful message
                    Throwable cause = ex;
                    while (cause != null && !(cause instanceof ConstraintViolationException)) {
                        cause = cause.getCause();
                    }
                    if (cause instanceof ConstraintViolationException) {
                        resp.setStatus(HttpServletResponse.SC_CONFLICT);
                        try (PrintWriter out = resp.getWriter()) { out.print("{\"error\":\"username exists\"}"); }
                    } else {
                        resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                        try (PrintWriter out = resp.getWriter()) { out.print("{\"error\":\"could not create user\"}"); }
                    }
                }
        } finally {
            session.close();
        }
    }

    // small helpers to read body and extract simple JSON values without extra libs
    private String readRequestBody(HttpServletRequest req) throws IOException {
        StringBuilder sb = new StringBuilder();
        String line;
        java.io.BufferedReader reader = req.getReader();
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        return sb.toString();
    }

    private String extractJsonString(String json, String key) {
        if (json == null) return null;
        int idx = json.indexOf("\"" + key + "\"");
        if (idx == -1) return null;
        int colon = json.indexOf(':', idx + key.length());
        if (colon == -1) return null;
        int start = colon + 1;
        while (start < json.length() && Character.isWhitespace(json.charAt(start))) start++;
        if (start >= json.length()) return null;
        char c = json.charAt(start);
        if (c == '"') {
            start++;
            int end = json.indexOf('"', start);
            if (end == -1) return null;
            return json.substring(start, end);
        } else {
            int end = start;
            while (end < json.length() && ",}] ".indexOf(json.charAt(end)) == -1) end++;
            return json.substring(start, end).trim();
        }
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
