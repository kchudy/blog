# Kubernetes deployment

Manifests for running Blog on a Kubernetes cluster. `.github/workflows/deploy.yml` applies these
automatically on every push to `main` that passes CI; see that file for the automated flow. This
doc covers the one-time setup a cluster needs before the first deploy.

See `.ai/decisions/ADR-0003-deploy-with-kubernetes.md` for why this exists alongside
`docker-compose.yml` (which remains the tool for local development) and `.ai/architecture.md`
for how it fits the rest of the system.

## Topology

One `web` Deployment (1 replica — see "Why one replica" below), fronted by a ClusterIP `Service`,
with an `initContainer` that runs migrations before gunicorn starts. The SQLite database file
lives on a `PersistentVolumeClaim` (`sqlite-data`) mounted at `/data` in both containers.

There's no Ingress here yet — the `Service` is ClusterIP-only. Add an Ingress (and point
`DJANGO_ALLOWED_HOSTS`/`DJANGO_CSRF_TRUSTED_ORIGINS` at the real hostname) once you have one to
route from.

## Why one replica

SQLite allows one writer at a time and its file lives on a single `ReadWriteOnce` volume — see
`.ai/decisions/ADR-0002-use-sqlite-instead-of-postgres.md`. Scaling `web` past 1 replica, or
switching the rollout `strategy` away from `Recreate`, risks two processes writing the same file
at once. If read traffic or availability needs eventually outgrow that, the fix is revisiting the
datastore (bringing back a networked database), not raising `replicas` on this Deployment.

## One-time cluster setup

1. **Create the namespace and app resources:**

   ```sh
   kubectl apply -k k8s/
   ```

   (This also creates the `web` Deployment/Service/PVC with the placeholder `:latest` image tag —
   harmless; the first real deploy from CI overwrites it.)

2. **Create the `DJANGO_SECRET_KEY` secret.** Not managed by CI or committed to the repo — follow
   the instructions at the top of `k8s/secret.example.yaml`.

3. **Set the real hostname.** Edit `DJANGO_ALLOWED_HOSTS` in `k8s/configmap.yaml` (currently the
   placeholder `blog.example.com`) and re-apply, or set it directly with
   `kubectl edit configmap blog-config -n blog` followed by
   `kubectl rollout restart deployment/web -n blog`.

4. **If the `ghcr.io/kchudy/blog` package is private**, either:
   - make the package public in its GitHub package settings (simplest — then delete
     `imagePullSecrets` from `k8s/deployment.yaml`), or
   - create a classic/fine-grained GitHub PAT with `read:packages` and store it as the
     `GHCR_PAT` repository secret — `deploy.yml` uses it to keep the `ghcr-pull-secret` image
     pull secret in the cluster up to date on every deploy.

## Required GitHub repository secrets

| Secret | Required | Purpose |
| --- | --- | --- |
| `KUBE_CONFIG` | Yes | Kubeconfig YAML as-is — `gh secret set KUBE_CONFIG < ~/.kube/config` (no base64 encoding) — with access to the `blog` namespace. Used by the `deploy` job in `.github/workflows/deploy.yml`. |
| `GHCR_PAT` | Only if the GHCR package is private | PAT with `read:packages`, used to refresh the cluster's `ghcr-pull-secret` each deploy. |

`GITHUB_TOKEN` (build/push to GHCR) is provided automatically by Actions — no setup needed.

## Manual operations

```sh
# Tail logs
kubectl logs -n blog deployment/web -f

# Open a Django shell against the running pod
kubectl exec -n blog deploy/web -it -- uv run python manage.py shell

# Back up the SQLite file
kubectl cp blog/$(kubectl get pod -n blog -l component=web -o jsonpath='{.items[0].metadata.name}'):/data/db.sqlite3 ./db.sqlite3.bak

# Force a rollout without a new image (e.g. after rotating the secret)
kubectl rollout restart deployment/web -n blog
```
