package com.pheonix.creditappraisalmemo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import com.pheonix.creditappraisalmemo.domain.*;
import java.util.Map;

@RestController
public class DebugCountController {

    @Autowired private BankTransactionRepository bankRepo;
    @Autowired private DocumentRepository docRepo;
    @Autowired private GstEntryRepository gstRepo;
    @Autowired private com.pheonix.creditappraisalmemo.repository.UserDetailsRepository userRepo;

    @GetMapping("/api/public/debug-counts")
    public Map<String, Long> getCounts() {
        return Map.of(
            "bank_transactions", bankRepo.count(),
            "documents", docRepo.count(),
            "gst_entries", gstRepo.count(),
            "users", userRepo.count()
        );
    }
}
