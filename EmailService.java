import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    public void sendTaskReminder(String toEmail, String taskTitle, String dueDate) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("TaskFlow Reminder: " + taskTitle);
        message.setText("Hello!\n\nYour task \"" + taskTitle + "\" is due on " + dueDate + ".\n\nPlease complete it soon!\n\n- TaskFlow Team");
        message.setFrom("noreply@taskflow.com");
        
        try {
            mailSender.send(message);
            System.out.println("Reminder email sent for task: " + taskTitle);
        } catch (Exception e) {
            System.out.println("Failed to send email: " + e.getMessage());
        }
    }
}