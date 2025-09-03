package controller;

import entity.Todo;
import entity.Category;
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

public class TodoServlet extends HttpServlet {
    @Override
    @SuppressWarnings("unchecked")
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json;charset=UTF-8");
        Session session = HibernateUtil.getSessionFactory().openSession();
        try {
            String userParam = req.getParameter("user");
            String userIdParam = req.getParameter("user_id");
            List<Todo> todos;
            if (userIdParam != null && !userIdParam.isEmpty()) {
                // filter by numeric user id
                todos = (List<Todo>) session.createQuery("from Todo t where t.user.id = :uid")
                        .setParameter("uid", Long.parseLong(userIdParam)).list();
            } else if (userParam != null && !userParam.isEmpty()) {
                // filter by username
                todos = (List<Todo>) session.createQuery("from Todo t where t.user.username = :u")
                        .setParameter("u", userParam).list();
            } else {
                todos = (List<Todo>) session.createQuery("from Todo").list();
            }
            StringBuilder sb = new StringBuilder();
            sb.append('[');
            for (int i = 0; i < todos.size(); i++) {
                Todo t = todos.get(i);
                sb.append('{')
                        .append("\"id\":").append(t.getId()).append(',')
                        .append("\"text\":\"").append(escape(t.getTitle())).append("\",")
                        .append("\"title\":\"").append(escape(t.getTitle())).append("\",")
                        .append("\"description\":\"").append(escape(t.getDescription() != null ? t.getDescription() : "")).append("\",")
                        .append("\"priority\":\"").append(escape(t.getPriority() != null ? t.getPriority() : "MEDIUM")).append("\",")
                        .append("\"is_completed\":").append(t.isCompleted() ? 1 : 0).append(',')
                        .append("\"user_id\":").append(t.getUser() != null ? t.getUser().getId() : "null")
                        .append('}');
                if (i < todos.size() - 1) sb.append(',');
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
        // support JSON body or form parameters
        String body = readRequestBody(req);
        String title = req.getParameter("title");
        String description = req.getParameter("description");
        String priority = req.getParameter("priority");
        String categoryId = req.getParameter("categoryId");
        String userId = req.getParameter("user_id");
        
        if ((title == null || title.isEmpty()) && body != null && body.length() > 0) {
            // Extract from JSON body
            title = extractJsonString(body, "title");
            // If title is still null, try "text" for backward compatibility
            if (title == null) title = extractJsonString(body, "text");
            
            description = extractJsonString(body, "description");
            priority = extractJsonString(body, "priority");
            String uid = extractJsonString(body, "user_id");
            if (uid != null) userId = uid;
        }
        
        resp.setContentType("application/json;charset=UTF-8");
        Session session = HibernateUtil.getSessionFactory().openSession();
        try {
            Transaction tx = session.beginTransaction();
            Todo t = new Todo(title, description, priority);
            if (categoryId != null) {
                Category c = (Category) session.get(Category.class, Long.parseLong(categoryId));
                t.setCategory(c);
            }
            if (userId != null) {
                User u = (User) session.get(User.class, Long.parseLong(userId));
                t.setUser(u);
            }
            session.save(t);
            tx.commit();
            try (PrintWriter out = resp.getWriter()) {
                // return created todo in frontend-friendly shape
                out.print("{\"id\":" + t.getId() + ",\"text\":\"" + escape(t.getTitle()) + "\",\"title\":\"" + escape(t.getTitle()) + "\",\"description\":\"" + escape(t.getDescription() != null ? t.getDescription() : "") + "\",\"priority\":\"" + escape(t.getPriority() != null ? t.getPriority() : "MEDIUM") + "\",\"is_completed\":" + (t.isCompleted() ? 1 : 0) + ",\"user_id\":" + (t.getUser() != null ? t.getUser().getId() : "null") + "}");
            }
        } finally {
            session.close();
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json;charset=UTF-8");
        String path = req.getPathInfo(); // expected /{id}
        if (path == null || path.length() <= 1) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }
        Long id = Long.parseLong(path.substring(1));
        Session session = HibernateUtil.getSessionFactory().openSession();
        try {
            Transaction tx = session.beginTransaction();
            Todo t = (Todo) session.get(Todo.class, id);
            if (t != null) {
                session.delete(t);
            }
            tx.commit();
            resp.setStatus(HttpServletResponse.SC_OK);
            try (PrintWriter out = resp.getWriter()) {
                out.print("{\"ok\":true}");
            }
        } finally {
            session.close();
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json;charset=UTF-8");
        String path = req.getPathInfo(); // expected /{id}
        if (path == null || path.length() <= 1) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            try (PrintWriter out = resp.getWriter()) { out.print("{\"error\":\"missing id in path\"}"); }
            return;
        }
        Long id = null;
        try {
            id = Long.parseLong(path.substring(1));
        } catch (NumberFormatException nfe) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            try (PrintWriter out = resp.getWriter()) { out.print("{\"error\":\"invalid id\"}"); }
            return;
        }

        String body = readRequestBody(req);
        System.out.println("TodoServlet.doPut - id=" + id + " body=" + body);
        Integer completedValue = null;
        if (body != null && body.length() > 0) {
            String cstr = extractJsonString(body, "is_completed");
            // Also check for "completed" for backward compatibility
            if (cstr == null) {
                cstr = extractJsonString(body, "completed");
            }
            if (cstr != null) {
                try {
                    completedValue = Integer.parseInt(cstr);
                } catch (NumberFormatException ex) {
                    if ("true".equalsIgnoreCase(cstr) || "false".equalsIgnoreCase(cstr)) {
                        completedValue = "true".equalsIgnoreCase(cstr) ? 1 : 0;
                    }
                }
            }
        }

        Session session = HibernateUtil.getSessionFactory().openSession();
        try {
            Transaction tx = session.beginTransaction();
            Todo t = (Todo) session.get(Todo.class, id);
            if (t == null) {
                tx.commit();
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                try (PrintWriter out = resp.getWriter()) { out.print("{\"error\":\"todo not found\"}"); }
                return;
            }

            String responseJson = "{\"ok\":false}";
            if (completedValue != null) {
                System.out.println("Setting completed for todo id=" + id + " to " + (completedValue != 0));
                t.setCompleted(completedValue != 0);
                session.update(t);
                // force flush so DB is updated before we respond
                session.flush();
                // build updated todo JSON
                responseJson = "{" +
                        "\"id\":" + t.getId() + "," +
                        "\"text\":\"" + escape(t.getTitle()) + "\"," +
                        "\"title\":\"" + escape(t.getTitle()) + "\"," +
                        "\"description\":\"" + escape(t.getDescription() != null ? t.getDescription() : "") + "\"," +
                        "\"priority\":\"" + escape(t.getPriority() != null ? t.getPriority() : "MEDIUM") + "\"," +
                        "\"is_completed\":" + (t.isCompleted() ? 1 : 0) + "," +
                        "\"user_id\":" + (t.getUser() != null ? t.getUser().getId() : "null") +
                        "}";
            } else {
                System.out.println("No completed value provided for todo id=" + id);
                // still return current todo state
                responseJson = "{" +
                        "\"id\":" + t.getId() + "," +
                        "\"text\":\"" + escape(t.getTitle()) + "\"," +
                        "\"title\":\"" + escape(t.getTitle()) + "\"," +
                        "\"description\":\"" + escape(t.getDescription() != null ? t.getDescription() : "") + "\"," +
                        "\"priority\":\"" + escape(t.getPriority() != null ? t.getPriority() : "MEDIUM") + "\"," +
                        "\"is_completed\":" + (t.isCompleted() ? 1 : 0) + "," +
                        "\"user_id\":" + (t.getUser() != null ? t.getUser().getId() : "null") +
                        "}";
            }

            tx.commit();
            resp.setStatus(HttpServletResponse.SC_OK);
            try (PrintWriter out = resp.getWriter()) {
                out.print(responseJson);
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
        // skip whitespace
        while (start < json.length() && Character.isWhitespace(json.charAt(start))) start++;
        if (start >= json.length()) return null;
        char c = json.charAt(start);
        if (c == '"') {
            start++;
            int end = json.indexOf('"', start);
            if (end == -1) return null;
            return json.substring(start, end);
        } else {
            // number or boolean
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
