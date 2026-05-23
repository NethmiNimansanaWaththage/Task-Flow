import com.taskflow.backend.entity.Task;
import com.taskflow.backend.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.List;

@Component
@EnableScheduling
public class ReminderScheduler {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private EmailService emailService;

    // Test method to verify scheduler is running - runs every 10 seconds
    @Scheduled(fixedDelay = 10000)
    public void testScheduler() {
        System.out.println("⏰ Scheduler is RUNNING at: " + LocalDateTime.now());
    }

    // This runs every minute to check for due tasks
    @Scheduled(cron = "0 * * * * *")
    public void sendDueDateReminders() {
        System.out.println("🔍 Checking for due tasks at: " + LocalDateTime.now());

        List<Task> pendingTasks = taskRepository.findByStatus("PENDING");
        System.out.println("📋 Found " + pendingTasks.size() + " pending tasks");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime twentyFourHoursLater = now.plusHours(24);

        for (Task task : pendingTasks) {
            if (task.getDueDate() != null) {
                System.out.println("📅 Task: " + task.getTitle() + " | Due: " + task.getDueDate());

                if (task.getDueDate().isAfter(now) && task.getDueDate().isBefore(twentyFourHoursLater)) {
                    System.out.println("⚠️ REMINDER: Task '" + task.getTitle() + "' is due on " + task.getDueDate());

                    // Uncomment this line when email is configured
                    // emailService.sendTaskReminder("your_email@gmail.com", task.getTitle(), task.getDueDate().toString());
                }
            }
        }
    }
}