FROM rust:1.72.1 as builder

WORKDIR /dufs
RUN apt update && apt install musl-tools -y

COPY assets /dufs/assets
COPY src /dufs/src
COPY Cargo.toml /dufs/Cargo.toml

RUN rustup target add x86_64-unknown-linux-musl && cargo build --release --target=x86_64-unknown-linux-musl

FROM scratch
COPY --from=builder /dufs/target/x86_64-unknown-linux-musl/release/dufs /bin/dufs
STOPSIGNAL SIGINT
ENTRYPOINT ["/bin/dufs"]
