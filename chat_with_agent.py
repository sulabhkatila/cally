#!/usr/bin/env python3
"""
Simple chat client to interact with TrialMonitor agent
"""

import asyncio
from uagents import Agent
from uagents_core.contrib.protocols.chat import (
    ChatMessage,
    TextContent,
    chat_protocol_spec,
)
from uagents_core.contrib.protocols.chat import ChatAcknowledgement

# Create a simple client agent
client = Agent(name="chat_client", seed="ClientSeed123!")

# Include chat protocol
client.include(chat_protocol_spec)

# TrialMonitor agent address (from the running agent)
TRIAL_MONITOR_ADDRESS = (
    "agent1qww3lnjv3cz36f6tfjddng9epnrqydv7xta93rrfxzl4tys6ttlt28dx337"
)


@client.on_event("startup")
async def startup(ctx):
    """Start the chat client"""
    ctx.logger.info("🤖 Chat client started")
    ctx.logger.info("💡 You can now send messages to the TrialMonitor agent")
    ctx.logger.info("📝 Type 'quit' to exit")


@client.on_message(ChatMessage)
async def handle_chat_message(ctx, sender, msg):
    """Handle incoming chat messages"""
    for item in msg.content:
        if isinstance(item, TextContent):
            ctx.logger.info(f"📨 TrialMonitor: {item.text}")
            break


@client.on_message(ChatAcknowledgement)
async def handle_acknowledgement(ctx, sender, msg):
    """Handle message acknowledgements"""
    ctx.logger.debug(f"✓ Message acknowledged by {sender}")


async def send_message(ctx, message):
    """Send a message to the TrialMonitor agent"""
    try:
        await ctx.send(
            TRIAL_MONITOR_ADDRESS,
            ChatMessage(content=[TextContent(text=message, type="text")]),
        )
        ctx.logger.info(f"📤 Sent: {message}")
    except Exception as e:
        ctx.logger.error(f"❌ Error sending message: {e}")


async def interactive_chat():
    """Interactive chat loop"""
    print("🤖 TrialMonitor Agent Chat Client")
    print("=" * 50)
    print("Agent Address:", TRIAL_MONITOR_ADDRESS)
    print("Type 'quit' to exit")
    print("=" * 50)

    # Start the client
    await client.start()

    try:
        while True:
            # Get user input
            message = input("\n💬 You: ").strip()

            if message.lower() in ["quit", "exit", "q"]:
                print("👋 Goodbye!")
                break

            if not message:
                continue

            # Send message to agent
            await send_message(client.ctx, message)

            # Wait a bit for response
            await asyncio.sleep(1)

    except KeyboardInterrupt:
        print("\n👋 Goodbye!")
    finally:
        await client.stop()


if __name__ == "__main__":
    asyncio.run(interactive_chat())
