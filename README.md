# jpgray.ca

I have a domain and a VPS for playing around and hosting various public services. This repository saves the
setup of the infrastructure and apps that I configure. You can expect noisy commits direct to master branch.

Domain hosted with Namecheap (`jpgray.ca`). VPS hosted with OVHCloud.

## Manual Setup

In theory this could be performed by terraform or similar but it's easier to just do it manually.

### Domain

All traffic should route from the domain to the VPS. Created the following records on Namecheap.

| Record    | Host | Value          | Options
| --------- | ---- | -------------- | -------
| A Record  | @    | 158.69.195.125 | TTL 30-min
| A Record  | *    | 158.69.195.125 | TTL 30-min
| MX Record | @    | jpgray.ca.     | TTL 5-min, priority 10
| MX Record | *    | jpgray.ca.     | TTL 5-min, priority 10

### Host

Install `k3s` and its requirements.

```shell
# https://docs.k3s.io/installation/requirements
sudo ufw disable

# https://docs.k3s.io/quick-start
# (it may ask for the password)
curl -sfL https://get.k3s.io | sh -
```

1. Installs a single-node cluster on the machine with everything it needs (datastore, control-plane, kubelet, and
   container runtime components)
2. K3s service(s) will automatically restart after node reboots or if the process crashes or is killed
3. A [kubeconfig](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/) file is
   written to `/etc/rancher/k3s/k3s.yaml` and `kubectl` on the host will automatically use it

Adding a node to an existing cluster requires a modified command which some additional configuration. I.e.,
setting `K3S_URL` and `K3S_TOKEN` environment variables. Details omitted from notes.

Configure `k3s` to use TLS so we can `kubectl` remotely. Use `vim` or similar to set:

`/etc/rancher/k3s/config.yaml`
```yaml
tls-san:
    - jpgray.ca
```

... and then run `systemctl restart k3s.service`.

Install `fail2ban` (auto-generates iptables rules to prevent connections from IPs that have recently failed SSH auth).

```shell
sudo apt update
sudo apt install fail2ban -y
```

To manage `fail2ban` you can use `sudo fail2ban-client` commands. Also `sudo systemctl <cmd> fail2ban.service`

```shell
sudo fail2ban-client status [jailname]
sudo fail2ban-client banned
```

## Kubectl remotely

There might be a better way of doing this, but here's what worked for me. It doesn't mess with any other kubeconfigs
your computer may have, but requires that you set `KUBECONFIG` environment variable appropriately whenever needed.

> Copy `/etc/rancher/k3s/k3s.yaml` from the VPS onto another managing machine (e.g.,  CICD pipeline or your laptop)
>
> 1. Save exact contents of `/etc/rancher/k3s/k3s.yaml` to `~/.kube/jpgray`
> 2. Run `export KUBECONFIG="$HOME/.kube/config:$HOME/.kube/jpgray"`
> 3. Edit that file: `clusters[].cluster.server = "https://127.0.0.1:6443"` to `https://jpgray.ca:6443`
> 4. Edit that file: change `default` to `jpgray` everywhere

Some relevant commands.

```shell
# check which contexts (clusters) exist
kubectl config get-contexts

# check which cluster you are currently working with
kubectl config current-context

# work against the jpgray cluster (context)
kubectl config use-context jpgray

# check aliveness of the cluster
kubectl cluster-info
kubectl get nodes
```

## Deploying

Uses [helmfile](https://github.com/helmfile/helmfile) to deploy to the cluster. Just run `helmfile apply`

TODO: implement some kind of script to clean up kubernetes components that are not core kube nor managed by helmfile.
