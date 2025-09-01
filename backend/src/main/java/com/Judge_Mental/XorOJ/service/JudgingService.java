package com.Judge_Mental.XorOJ.service;

import java.io.IOException;

import org.springframework.stereotype.Service;

import com.Judge_Mental.XorOJ.judge.CppExecutor;
import com.Judge_Mental.XorOJ.judge.CppExecutor.RunResult;

@Service
public class JudgingService {

    private CppExecutor cppExecutor;

    JudgingService(CppExecutor cppExecutor){
        this.cppExecutor = cppExecutor;
    }

    public RunResult runCodeWithTest(String code, String input) throws IOException, InterruptedException {
        return cppExecutor.execute(code, input, 2, 128, 1.0);
    }

}
