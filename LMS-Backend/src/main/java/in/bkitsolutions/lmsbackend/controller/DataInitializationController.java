package in.bkitsolutions.lmsbackend.controller;

import in.bkitsolutions.lmsbackend.dto.ApiResponse;
import in.bkitsolutions.lmsbackend.service.DataInitializationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/data")
public class DataInitializationController {

    @Autowired
    private DataInitializationService dataInitializationService;

    @PostMapping("/initialize")
    public ApiResponse<String> initializeData() {
        try {
            dataInitializationService.initializeAllData();
            return ApiResponse.ok("Data initialized successfully", 
                "All dummy data has been created. Check console for login credentials.");
        } catch (Exception e) {
            return ApiResponse.fail("Failed to initialize data: " + e.getMessage());
        }
    }

    @DeleteMapping("/clear")
    public ApiResponse<String> clearData() {
        try {
            dataInitializationService.clearAllData();
            return ApiResponse.ok("Data cleared successfully", 
                "All data has been removed from the database.");
        } catch (Exception e) {
            return ApiResponse.fail("Failed to clear data: " + e.getMessage());
        }
    }

    @PostMapping("/reset")
    public ApiResponse<String> resetData() {
        try {
            dataInitializationService.clearAllData();
            dataInitializationService.initializeAllData();
            return ApiResponse.ok("Data reset successfully", 
                "All data has been cleared and reinitialized. Check console for login credentials.");
        } catch (Exception e) {
            return ApiResponse.fail("Failed to reset data: " + e.getMessage());
        }
    }
}