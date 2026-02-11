package in.bkitsolutions.lmsbackend.repository;

import in.bkitsolutions.lmsbackend.model.ChapterProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChapterProgressRepository extends JpaRepository<ChapterProgress, Long> {
    Optional<ChapterProgress> findByChapterIdAndStudentId(Long chapterId, Long studentId);
    List<ChapterProgress> findByStudentId(Long studentId);
    List<ChapterProgress> findByStudentIdAndCompletedTrue(Long studentId);
    List<ChapterProgress> findByChapterTopicIdAndStudentId(Long topicId, Long studentId);
    long countByChapterTopicIdAndStudentIdAndCompletedTrue(Long topicId, Long studentId);
}
