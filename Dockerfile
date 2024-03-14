FROM rust:1.72.1 as builder

WORKDIR /dufs
RUN apt update && apt install musl-tools -y

COPY assets /dufs/assets
COPY src /dufs/src
COPY Cargo.toml /dufs/Cargo.toml

RUN cargo build --release

FROM ubuntu:22.04
COPY --from=builder /dufs/target/release/dufs /bin/dufs
STOPSIGNAL SIGINT
ENTRYPOINT ["/bin/dufs"]
