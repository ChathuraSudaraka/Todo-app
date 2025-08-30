package controller;

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

public class CategoryServlet extends HttpServlet {
    @Override
    @SuppressWarnings("unchecked")
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json;charset=UTF-8");
        Session session = HibernateUtil.getSessionFactory().openSession();
        try {
            List<Category> categories = (List<Category>) session.createQuery("from Category").list();
            StringBuilder sb = new StringBuilder();
            sb.append('[');
            for (int i = 0; i < categories.size(); i++) {
                Category c = categories.get(i);
                sb.append('{')
                        .append("\"id\":").append(c.getId()).append(',')
                        .append("\"name\":\"").append(escape(c.getName())).append("\"")
                        .append('}');
                if (i < categories.size() - 1) sb.append(',');
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
        String name = req.getParameter("name");
        String userId = req.getParameter("userId");
        resp.setContentType("application/json;charset=UTF-8");
        Session session = HibernateUtil.getSessionFactory().openSession();
        try {
            Transaction tx = session.beginTransaction();
            Category c = new Category(name);
            if (userId != null) {
                User u = (User) session.get(User.class, Long.parseLong(userId));
                c.setUser(u);
            }
            session.save(c);
            tx.commit();
            try (PrintWriter out = resp.getWriter()) {
                out.print("{\"id\":" + c.getId() + "}");
            }
        } finally {
            session.close();
        }
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
