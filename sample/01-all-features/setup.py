import os
import subprocess
import shutil
import paramiko

def deploy_locally():
    print("\nLocal Deployment:")
    shutil.copy("env-example", ".env")
    subprocess.run(["docker", "compose", "up", "-d"])
    print("Local deployment completed.")

def deploy_remotely():
    print("\nRemote Deployment:")
    
    remote_host = input("Enter the remote host IP or domain: ")
    remote_port = input("Enter the SSH port (default is 22, press Enter to use default): ") or 22
    remote_username = input("Enter the SSH username: ")
    
    private_key_path = input("Enter the path to your private key file: ")
    private_key_password = get_private_key_password()
    
    ssh_client = paramiko.SSHClient()
    ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    private_key = paramiko.RSAKey(filename=private_key_path, password=private_key_password)
    
    try:
        ssh_client.connect(remote_host, port=int(remote_port), username=remote_username, pkey=private_key)
        
        git_check_command = "if [ -d 'stencil' ]; then echo 'Repo exists'; else echo 'Repo not found'; fi"
        git_check_output = run_ssh_command(ssh_client, git_check_command)
        
        if "Repo exists" in git_check_output:
            print("Git repository already exists. Skipping cloning.")
        else:
            git_clone_command = "git clone https://github.com/ChakshuGautam/stencil && cd stencil && cp env-example .env && docker compose up -d"
            git_clone_output = run_ssh_command(ssh_client, git_clone_command)
            print("Git repository cloned.")
        
        docker_compose_command = "cd stencil && cp env-example .env && docker compose up -d"
        docker_compose_output = run_ssh_command(ssh_client, docker_compose_command)
        print("Docker Compose started.")

    except Exception as e:
        print(f"Error: {e}")

    finally:
        ssh_client.close()

    print("Remote deployment completed.")

def get_private_key_password():
    while True:
        key_password = input("Is your private key password-protected? (y/n): ")
        if key_password.lower() == "y":
            return input("Enter the private key password: ")
        elif key_password.lower() == "n":
            return None
        print("Invalid input. Please enter 'y' for a password-protected key or 'n' for an unencrypted key.")

def run_ssh_command(ssh_client, command):
    ssh_stdin, ssh_stdout, ssh_stderr = ssh_client.exec_command(command)
    output = ssh_stdout.read().decode("utf-8")
    return output

print("\nDeployment Options:")
print("1. Deploy Locally (Development)")
print("2. Deploy to a Remote Server")

deployment_choice = input("Select a deployment option (1/2): ")

if deployment_choice == "1":
    deploy_locally()
elif deployment_choice == "2":
    deploy_remotely()
else:
    print("Invalid choice. Exiting...")

print("Deployment complete.")