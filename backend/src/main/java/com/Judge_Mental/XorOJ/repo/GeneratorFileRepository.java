package com.Judge_Mental.XorOJ.repo;

import com.Judge_Mental.XorOJ.entity.GeneratorFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GeneratorFileRepository extends JpaRepository<GeneratorFile, Integer> {
    List<GeneratorFile> findByProblemId(Long problemId);
    Optional<GeneratorFile> findByProblemIdAndGeneratorId(Long problemId, Integer generatorId);
    boolean existsByProblemIdAndGeneratorId(Long problemId, Integer generatorId);
    void deleteByProblemIdAndGeneratorId(Long problemId, Integer generatorId);
}
