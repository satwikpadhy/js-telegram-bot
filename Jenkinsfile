pipeline {
    agent any
    // environment {
        
    // }
    stages {
        stage('Dummy Stage') {
            steps {
                script {
                        sh """
                        echo "Dummy Echo"
                        """
                    
                }
            }
        }
    }
    post {
        success {
            echo 'Build Success'
        }
        failure {
            echo 'Failure'
        }
    }
}