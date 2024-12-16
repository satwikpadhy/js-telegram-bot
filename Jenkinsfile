pipeline {
    agent any

    environment {
        IMAGE_NAME = "js-telegram-bot" // Replace with your Docker image name
        CONTAINER_NAME = "js-telegram-bot-dev"
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo 'Checking out source code...'
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
                    def appVersion = sh(script: "node -p 'require(\"./package.json\").version'", returnStdout: true).trim()
                    docker.build("${IMAGE_NAME}:${appVersion}")
                }
                echo 'Built Docker image Successfully...'
            }
        }

        stage('Retrieve Environment Variables') {
            steps {
                script {
                    // Fetch environment variables from the existing container
                    sh """
                    docker inspect --format='{{range .Config.Env}}{{println .}}{{end}}' $CONTAINER_NAME > env_vars.txt
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
                    sh """
                    docker stop $CONTAINER_NAME || true
                    docker rm $CONTAINER_NAME || true
                    """

                    // Start the new container with extracted environment variables
                    def envVarsString = envVars.collect { "-e ${it}" }.join(' ')
                    sh """
                    docker run -d --name $CONTAINER_NAME ${envVarsString} ${IMAGE_NAME}
                    """
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
