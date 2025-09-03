package entity;

import java.io.Serializable;
import java.util.Date;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "todos")
public class Todo implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String title;

	@Column(length = 2000)
	private String description;

	@Column(length = 20)
	private String priority = "MEDIUM";

	@Column(name = "is_completed")
	private Boolean completed = false;

	@Column(name = "created_at")
	private Date createdAt = new Date();

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "category_id")
	private Category category;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id")
	private User user;

	public Todo() {}

	public Todo(String title, String description) {
		this.title = title;
		this.description = description;
		this.priority = "MEDIUM"; // default priority
	}

	public Todo(String title, String description, String priority) {
		this.title = title;
		this.description = description;
		this.priority = normalizePriority(priority);
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getPriority() {
		return priority;
	}

	public void setPriority(String priority) {
		this.priority = normalizePriority(priority);
	}

	private String normalizePriority(String priority) {
		if (priority == null) return "MEDIUM";
		String upperPriority = priority.toUpperCase().trim();
		if ("LOW".equals(upperPriority) || "MEDIUM".equals(upperPriority) || "HIGH".equals(upperPriority)) {
			return upperPriority;
		}
		return "MEDIUM"; // default for invalid values
	}

	public boolean isCompleted() {
		return completed != null && completed.booleanValue();
	}

	public void setCompleted(Boolean completed) {
		this.completed = completed;
	}

	public Date getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Date createdAt) {
		this.createdAt = createdAt;
	}

	public Category getCategory() {
		return category;
	}

	public void setCategory(Category category) {
		this.category = category;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}
}
