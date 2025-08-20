package com.Judge_Mental.XorOJ.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ContentController {



    @GetMapping("/signup")
    public String signup() {
        return "signup";
    }

}
