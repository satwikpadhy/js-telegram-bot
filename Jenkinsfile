pipeline {
    agent {label get_agent_label(env.BRANCH_NAME)}

    environment {
        IMAGE_NAME = "js-telegram-bot" // Replace with your Docker image name
        CONTAINER_NAME_DEV = "js-telegram-bot-dev"
        CONTAINER_NAME = "js-telegram-bot"
        DEV_HEALTHCHECK_PORT = "8321"
        PROD_HEALTHCHECK_PORT = "8321"
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo 'Checking out source code... branch is ' + env.BRANCH_NAME
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing Node.js dependencies...'
                sh 'npm install'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                script {
                    appVersion = sh(script: "node -p 'require(\"./package.json\").version'", returnStdout: true).trim()
                    docker.build("${IMAGE_NAME}:${appVersion}")
                }
                echo 'Built Docker image Successfully...'
            }
        }

        stage('Retrieve Environment Variables') {
            steps {
                script {
                    //Determine branch
                    def branchName = env.BRANCH_NAME
                    if (branchName == 'prod'){
                        TARGET_CONTAINER_NAME = "${CONTAINER_NAME}"
                    }
                    else if(branchName == 'dev'){
                        TARGET_CONTAINER_NAME = "${CONTAINER_NAME_DEV}"
                    }
                    // Fetch environment variables from the existing container
                    sh """
                    docker inspect --format='{{range .Config.Env}}{{println .}}{{end}}' $TARGET_CONTAINER_NAME > env_vars.txt
                    """
                    envVars = readFile('env_vars.txt').split('\n').findAll { it.trim() }
                    echo "Extracted Environment Variables: ${envVars}"
                }
            }
        }

        stage('Deploy Container') {
            steps {
                script {
                    // Stop and remove the existing container
                    OLD_IMAGE_ID = sh(script: "docker inspect --format='{{.Image}}' $TARGET_CONTAINER_NAME", returnStdout: true).trim()
                    sh "docker stop $TARGET_CONTAINER_NAME || true"
                    sh "docker rm $TARGET_CONTAINER_NAME || true"
                    sh "docker image rm $OLD_IMAGE_ID || true"

                    // Start the new container with extracted environment variables
                    def envVarsString = envVars.collect { "-e ${it}" }.join(' ')

                    if (branchName == 'prod'){
                        // TARGET_CONTAINER_NAME = "${CONTAINER_NAME}"
                        sh "docker run -d -p ${PROD_HEALTHCHECK_PORT}:${PROD_HEALTHCHECK_PORT} --restart unless-stopped --name $TARGET_CONTAINER_NAME ${envVarsString} ${IMAGE_NAME}:${appVersion}"
                    }
                    else if(branchName == 'dev'){
                        // TARGET_CONTAINER_NAME = "${CONTAINER_NAME_DEV}"
                        sh "docker run -d -p ${DEV_HEALTHCHECK_PORT}:${DEV_HEALTHCHECK_PORT} --restart unless-stopped --name $TARGET_CONTAINER_NAME ${envVarsString} ${IMAGE_NAME}:${appVersion}"
                    }
                    // sh "docker run -d --restart unless-stopped --name $TARGET_CONTAINER_NAME ${envVarsString} ${IMAGE_NAME}:${appVersion}"
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment succeeded!'
        }
        failure {
            echo 'Deployment failed.'
        }
    }
}

def get_agent_label(branch_name) {
        switch(branch_name) {
            case 'dev':
                return "cruzex-pi"
            // case 'uat':
            //     return ""
            case 'prod':
                return "cruzex-lenovo"
        }
    }