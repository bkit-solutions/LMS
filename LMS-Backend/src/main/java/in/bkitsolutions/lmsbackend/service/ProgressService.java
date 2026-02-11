package in.bkitsolutions.lmsbackend.service;

import in.bkitsolutions.lmsbackend.model.*;
import in.bkitsolutions.lmsbackend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class ProgressService {
    private final ChapterProgressRepository chapterProgressRepository;
    private final ChapterRepository chapterRepository;
    private final UserRepository userRepository;

    public ProgressService(ChapterProgressRepository chapterProgressRepository,
                           ChapterRepository chapterRepository,
                           UserRepository userRepository) {
        this.chapterProgressRepository = chapterProgressRepository;
        this.chapterRepository = chapterRepository;
        this.userRepository = userRepository;
    }

    public void markChapterCompleted(String studentEmail, Long chapterId) {
        User student = requireUser(studentEmail);
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chapter not found"));

        ChapterProgress progress = chapterProgressRepository
                .findByChapterIdAndStudentId(chapterId, student.getId())
                .orElse(ChapterProgress.builder()
                        .chapter(chapter)
                        .student(student)
                        .build());

        progress.setCompleted(true);
        progress.setCompletedAt(LocalDateTime.now());
        chapterProgressRepository.save(progress);
    }

    public void updateTimeSpent(String studentEmail, Long chapterId, Long additionalSeconds) {
        User student = requireUser(studentEmail);
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chapter not found"));

        ChapterProgress progress = chapterProgressRepository
                .findByChapterIdAndStudentId(chapterId, student.getId())
                .orElse(ChapterProgress.builder()
                        .chapter(chapter)
                        .student(student)
                        .timeSpentSeconds(0L)
                        .build());

        progress.setTimeSpentSeconds(progress.getTimeSpentSeconds() + additionalSeconds);
        chapterProgressRepository.save(progress);
    }

    public boolean isChapterCompleted(String studentEmail, Long chapterId) {
        User student = requireUser(studentEmail);
        return chapterProgressRepository.findByChapterIdAndStudentId(chapterId, student.getId())
                .map(ChapterProgress::getCompleted)
                .orElse(false);
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}
