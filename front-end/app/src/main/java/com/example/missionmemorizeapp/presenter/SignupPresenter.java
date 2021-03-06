package com.example.missionmemorizeapp.presenter;

import com.example.missionmemorizeapp.model.CurrentSessionHolder;
import com.example.missionmemorizeapp.model.Folder;
import com.example.missionmemorizeapp.model.Project;
import com.example.missionmemorizeapp.model.User;
import com.example.missionmemorizeapp.model.Verse;
import com.example.missionmemorizeapp.services.request.LoginRequest;
import com.example.missionmemorizeapp.services.*;
import com.example.missionmemorizeapp.services.request.SignupRequest;
import com.example.missionmemorizeapp.services.response.SignupResponse;

import java.io.IOException;

public class SignupPresenter {

    private final SignupPresenter.View view;

    /**
     * The interface by which this presenter communicates with it's view.
     */
    public interface View {
    }

    public SignupPresenter(SignupPresenter.View view) {
        this.view = view;
    }

    public SignupResponse signUpUser(SignupRequest request) throws IOException {
        SignUpService signUpService = new SignUpService();
        SignupResponse response = signUpService.signUpUser(request);

        /*Verse newVerse = new Verse(343, "3 Nephi", 455, 21, 17, "And when he had said these words, he wept, and the multitude bare record of it, and he took their little children, one by one, and blessed them, and prayed unto the Father for them.");
        Project newProject = new Project();
        newProject.getVersesInProject().add(newVerse);
        newProject.setNumAttempts(5);
        newProject.setNumCorrect(1);
        Folder newFolder = new Folder();
        newFolder.setFolderName("Mission Verses");
        newFolder.getProjectsInFolder().add(newProject);
        CurrentSessionHolder.getInstance().getRootProjectsOfUser().add(newProject);
        CurrentSessionHolder.getInstance().getFoldersOfUser().add(newFolder);*/
        CurrentSessionHolder.getInstance().setSignedInUser(response.getUser());

        return response;
    }
}
