pipeline {
  agent any

  environment {
    IMAGE = "career-navigator"
    REGISTRY = "<your-registry-url>" // e.g., gcr.io/my-project
    KUBE_NAMESPACE = "career-navigator"
  }

  stages {
    stage('Clone Repository') {
      steps {
        git 'https://github.com/sharathgoyal/ai-career-path-navigator.git'
      }
    }

    stage('Install Dependencies') {
      steps {
        sh 'npm install'
      }
    }

    stage('Build Project') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Build Docker Image') {
      steps {
        sh "docker build -t $REGISTRY/$IMAGE:latest ."
      }
    }

    stage('Push Docker Image') {
      steps {
        withCredentials([string(credentialsId: 'gcp-json-key', variable: 'GCLOUD_SERVICE_KEY')]) {
          sh '''
            echo $GCLOUD_SERVICE_KEY > key.json
            gcloud auth activate-service-account --key-file=key.json
            gcloud auth configure-docker
            docker push $REGISTRY/$IMAGE:latest
          '''
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        sh '''
          kubectl config set-context --current --namespace=$KUBE_NAMESPACE
          kubectl apply -f k8s/deployment.yaml
          kubectl apply -f k8s/service.yaml
        '''
      }
    }
  }
}
