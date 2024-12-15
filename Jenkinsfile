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
                    def appVersion = sh(script: "node -p 'require(\'./package.json\').version'", returnStdout: true).trim()
                    docker.build("${IMAGE_NAME}:${appVersion}")
                }
            }
        }

        stage('Deploy Container') {
            steps {
                echo 'Deploying updated container...'
                sh '''
                    docker stop ${CONTAINER_NAME} || true
                    docker rm ${CONTAINER_NAME} || true
                    docker run -d --name ${CONTAINER_NAME} ${IMAGE_NAME}
                '''
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
