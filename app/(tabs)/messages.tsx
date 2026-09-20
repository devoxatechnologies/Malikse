import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import AppHeader from "../../components/AppHeader";
import { useLanguageStore } from "../../src/store/languageStore";
import { t } from "../../src/i18n/translations";

// Top container background: 2nd uploaded scenic image
const heroScenicImg = require("../../assets/messages_hero_scenic.jpg");

interface MessageItem {
  id: string;
  sender: "them" | "me";
  text: string;
  time: string;
  attachment?: {
    title: string;
    type: "document" | "report" | "offer";
    size?: string;
  };
}

interface TagItem {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  bg: string;
  border?: string;
}

interface Conversation {
  id: string;
  name: string;
  role: string;
  roleType: "owner" | "advisor" | "buyer";
  avatarLetter: string;
  avatarColor: string;
  verified: boolean;
  property: string;
  lastMsg: string;
  time: string;
  timestampNum: number;
  unread: boolean;
  tag1: TagItem;
  tag2: TagItem;
  messages: MessageItem[];
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    name: "Ramesh Kumar (Verified Owner)",
    role: "Verified Owner",
    roleType: "owner",
    avatarLetter: "R",
    avatarColor: "#0D9488",
    verified: true,
    property: "Plot on Main Bailey Road, Patna",
    lastMsg: "I have shared the latest circle office mutation receipt.",
    time: "10:30 AM",
    timestampNum: 1726808400000,
    unread: true,
    tag1: {
      label: "Document Shared",
      icon: "description",
      color: "#065F46",
      bg: "#ECFDF5",
      border: "#A7F3D0",
    },
    tag2: {
      label: "Verified Owner",
      icon: "verified-user",
      color: "#065F46",
      bg: "#ECFDF5",
      border: "#A7F3D0",
    },
    messages: [
      {
        id: "m1",
        sender: "them",
        text: "Namaste! Thank you for inquiring about my 2400 sq.ft plot on Main Bailey Road.",
        time: "10:15 AM",
      },
      {
        id: "m2",
        sender: "them",
        text: "I have shared the latest circle office mutation receipt.",
        time: "10:30 AM",
        attachment: {
          title: "Circle_Office_Mutation_Receipt_2026.pdf",
          type: "document",
          size: "1.4 MB",
        },
      },
    ],
  },
  {
    id: "c2",
    name: "Amit Singh (MalikSe Advisor)",
    role: "MalikSe Advisor",
    roleType: "advisor",
    avatarLetter: "A",
    avatarColor: "#2563EB",
    verified: true,
    property: "Site Inspection Task #402",
    lastMsg: "GPS geo-boundary survey report has been uploaded.",
    time: "Yesterday",
    timestampNum: 1726722000000,
    unread: false,
    tag1: {
      label: "Report Shared",
      icon: "description",
      color: "#1D4ED8",
      bg: "#EFF6FF",
      border: "#BFDBFE",
    },
    tag2: {
      label: "Advisor",
      icon: "verified-user",
      color: "#1D4ED8",
      bg: "#EFF6FF",
      border: "#BFDBFE",
    },
    messages: [
      {
        id: "m1",
        sender: "them",
        text: "Hello Nikhil! The on-ground physical inspection for your Danapur plot #402 was completed yesterday morning.",
        time: "Yesterday, 3:20 PM",
      },
      {
        id: "m2",
        sender: "them",
        text: "GPS geo-boundary survey report has been uploaded.",
        time: "Yesterday, 4:05 PM",
        attachment: {
          title: "GPS_GeoBoundary_Survey_Report_402.pdf",
          type: "report",
          size: "3.2 MB",
        },
      },
    ],
  },
  {
    id: "c3",
    name: "Suresh Prasad (Buyer)",
    role: "Buyer",
    roleType: "buyer",
    avatarLetter: "S",
    avatarColor: "#B45309",
    verified: true,
    property: "Residential Land in Bihta",
    lastMsg: "Token offer of ₹30 Lakh submitted for owner review.",
    time: "16 Sep",
    timestampNum: 1726462800000,
    unread: false,
    tag1: {
      label: "Offer Submitted",
      icon: "payments",
      color: "#065F46",
      bg: "#ECFDF5",
      border: "#A7F3D0",
    },
    tag2: {
      label: "Buyer",
      icon: "person",
      color: "#C2410C",
      bg: "#FFF7ED",
      border: "#FED7AA",
    },
    messages: [
      {
        id: "m1",
        sender: "them",
        text: "Hello sir, I visited the Bihta plot location with my family and we really liked the boundary demarcation.",
        time: "16 Sep, 11:10 AM",
      },
      {
        id: "m2",
        sender: "them",
        text: "Token offer of ₹30 Lakh submitted for owner review.",
        time: "16 Sep, 2:45 PM",
        attachment: {
          title: "Token_Offer_Letter_30_Lakh.pdf",
          type: "offer",
          size: "Token Advance: ₹50,000",
        },
      },
    ],
  },
  {
    id: "c4",
    name: "Priya Verma (Interested Buyer)",
    role: "Interested Buyer",
    roleType: "buyer",
    avatarLetter: "P",
    avatarColor: "#7C3AED",
    verified: false,
    property: "Plot in Danapur",
    lastMsg: "Can you share the latest price and available size details?",
    time: "14 Sep",
    timestampNum: 1726290000000,
    unread: false,
    tag1: {
      label: "Price Query",
      icon: "help",
      color: "#6D28D9",
      bg: "#F5F3FF",
      border: "#DDD6FE",
    },
    tag2: {
      label: "Buyer",
      icon: "person",
      color: "#C2410C",
      bg: "#FFF7ED",
      border: "#FED7AA",
    },
    messages: [
      {
        id: "m1",
        sender: "them",
        text: "Namaste! I saw your Danapur property listing and was interested in knowing more details.",
        time: "14 Sep, 10:00 AM",
      },
      {
        id: "m2",
        sender: "them",
        text: "Can you share the latest price and available size details?",
        time: "14 Sep, 10:05 AM",
      },
    ],
  },
  {
    id: "c5",
    name: "Manish Tiwari (Owner)",
    role: "Owner",
    roleType: "owner",
    avatarLetter: "M",
    avatarColor: "#0D9488",
    verified: false,
    property: "Commercial Plot – Bailey Road",
    lastMsg: "Site photos and documents are attached.",
    time: "12 Sep",
    timestampNum: 1726117200000,
    unread: false,
    tag1: {
      label: "Documents",
      icon: "description",
      color: "#065F46",
      bg: "#ECFDF5",
      border: "#A7F3D0",
    },
    tag2: {
      label: "Owner",
      icon: "home",
      color: "#1D4ED8",
      bg: "#EFF6FF",
      border: "#BFDBFE",
    },
    messages: [
      {
        id: "m1",
        sender: "them",
        text: "Hello! Here are the commercial land details as requested.",
        time: "12 Sep, 3:15 PM",
      },
      {
        id: "m2",
        sender: "them",
        text: "Site photos and documents are attached.",
        time: "12 Sep, 3:20 PM",
        attachment: {
          title: "Site_Photos_Commercial_Bailey.pdf",
          type: "document",
          size: "4.8 MB",
        },
      },
    ],
  },
];

export default function MessagesScreenMobile() {
  const router = useRouter();
  const { language } = useLanguageStore();

  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "archived">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState<"latest" | "oldest">("latest");
  const [showSortModal, setShowSortModal] = useState<boolean>(false);

  // Active chat state for full conversation modal
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [replyText, setReplyText] = useState<string>("");

  // Unread count
  const unreadCount = useMemo(() => {
    return conversations.filter((c) => c.unread).length;
  }, [conversations]);

  // Filtered & sorted conversations
  const filteredConversations = useMemo(() => {
    let list = [...conversations];

    // Tab Filter
    if (activeTab === "unread") {
      list = list.filter((c) => c.unread);
    } else if (activeTab === "archived") {
      list = []; // No archived items initially
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.property.toLowerCase().includes(q) ||
          c.lastMsg.toLowerCase().includes(q)
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortOption === "latest") {
        return b.timestampNum - a.timestampNum;
      } else {
        return a.timestampNum - b.timestampNum;
      }
    });

    return list;
  }, [conversations, activeTab, searchQuery, sortOption]);

  const handleOpenChat = (c: Conversation) => {
    setSelectedChat(c);
    // Mark conversation as read
    if (c.unread) {
      setConversations((prev) =>
        prev.map((item) => (item.id === c.id ? { ...item, unread: false } : item))
      );
    }
  };

  const handleSendMessage = () => {
    if (!replyText.trim() || !selectedChat) return;

    const newMsg: MessageItem = {
      id: `m_${Date.now()}`,
      sender: "me",
      text: replyText.trim(),
      time: "Just now",
    };

    const updated = {
      ...selectedChat,
      messages: [...selectedChat.messages, newMsg],
      lastMsg: replyText.trim(),
      time: "Just now",
      timestampNum: Date.now(),
    };

    setSelectedChat(updated);
    setConversations((prev) =>
      prev.map((item) => (item.id === selectedChat.id ? updated : item))
    );
    setReplyText("");
  };

  return (
    <View style={styles.screen}>
      {/* 1. Global Brand Header */}
      <AppHeader
        showBack={false}
        showNavLinks={false}
        showLanguageToggle={true}
        showPostPropertyBtn={false}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= 2. HERO BANNER (TOP CONTAINER) ================= */}
        <View style={styles.heroContainer}>
          {/* Scenic Background Image */}
          <Image
            source={heroScenicImg}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Soft semi-translucent gradient overlay on the left */}
          <View style={styles.heroOverlay} />

          {/* Top Row: Left Direct Messages + Right Cursive Script */}
          <View style={styles.heroTopRow}>
            <View style={styles.heroTitlesWrap}>
              <Text style={styles.heroCategoryLabel}>
                {t(language, "messages_direct") || "DIRECT MESSAGES"}
              </Text>
              <Text style={styles.heroHeadline}>
                Secure Conversations{"\n"}for Better Deals
              </Text>
              <Text style={styles.heroSubtitle}>
                Connect, share documents and stay updated{"\n"}with buyers, owners and advisors.
              </Text>
            </View>

            {/* Right Top Cursive Script */}
            <View style={styles.heroCursiveWrap}>
              <Text style={styles.heroCursiveText}>
                Good Conversations{"\n"}Build Great{"\n"}Opportunities
              </Text>
            </View>
          </View>

          {/* Bottom 3 Floating Feature Pills */}
          <View style={styles.heroPillsRow}>
            {/* Pill 1: Protected by OTP */}
            <View style={styles.heroPill}>
              <View style={styles.heroPillIconBox}>
                <MaterialIcons name="lock" size={14} color="#059669" />
              </View>
              <View style={styles.heroPillTextWrap}>
                <Text style={styles.heroPillTitle}>Protected</Text>
                <Text style={styles.heroPillSub}>by OTP</Text>
              </View>
            </View>

            {/* Pill 2: No Spam Genuine Users Only */}
            <View style={styles.heroPill}>
              <View style={styles.heroPillIconBox}>
                <MaterialIcons name="verified-user" size={14} color="#059669" />
              </View>
              <View style={styles.heroPillTextWrap}>
                <Text style={styles.heroPillTitle}>No Spam</Text>
                <Text style={styles.heroPillSub} numberOfLines={1}>Genuine Users Only</Text>
              </View>
            </View>

            {/* Pill 3: Trusted Platform Verified People */}
            <View style={styles.heroPill}>
              <View style={styles.heroPillIconBox}>
                <FontAwesome5 name="handshake" size={12} color="#059669" />
              </View>
              <View style={styles.heroPillTextWrap}>
                <Text style={styles.heroPillTitle}>Trusted Platform</Text>
                <Text style={styles.heroPillSub} numberOfLines={1}>Verified People</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ================= 3. SEARCH & SORT ROW ================= */}
        <View style={styles.searchSortRow}>
          {/* Search bar */}
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={18} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search messages by name, property, or keywords..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")} activeOpacity={0.7}>
                <MaterialIcons name="close" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Sort Dropdown */}
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setShowSortModal(true)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="swap-vert" size={16} color="#0F172A" />
            <Text style={styles.sortButtonText}>
              {sortOption === "latest" ? "Latest First" : "Oldest First"}
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={16} color="#475569" />
          </TouchableOpacity>
        </View>

        {/* ================= 4. SEGMENTED FILTER TABS ================= */}
        <View style={styles.tabsContainer}>
          {/* All Messages */}
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "all" && styles.tabBtnActive]}
            onPress={() => setActiveTab("all")}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === "all" && styles.tabTextActive]}>
              All Messages
            </Text>
          </TouchableOpacity>

          {/* Unread */}
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "unread" && styles.tabBtnActive]}
            onPress={() => setActiveTab("unread")}
            activeOpacity={0.8}
          >
            <View style={styles.unreadTabContent}>
              <Text style={[styles.tabText, activeTab === "unread" && styles.tabTextActive]}>
                Unread
              </Text>
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Archived */}
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "archived" && styles.tabBtnActive]}
            onPress={() => setActiveTab("archived")}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === "archived" && styles.tabTextActive]}>
              Archived
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= 5. MESSAGE LIST CARDS ================= */}
        <View style={styles.messagesList}>
          {filteredConversations.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="mail-outline" size={44} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No messages found</Text>
              <Text style={styles.emptySub}>
                {searchQuery
                  ? "No conversations match your search terms."
                  : activeTab === "unread"
                  ? "You have caught up with all your messages."
                  : "No conversations archived yet."}
              </Text>
            </View>
          ) : (
            filteredConversations.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => handleOpenChat(item)}
                activeOpacity={0.9}
              >
                <View style={styles.cardRow}>
                  {/* Left Avatar */}
                  <View style={styles.avatarWrap}>
                    <View
                      style={[
                        styles.avatarCircle,
                        { backgroundColor: item.avatarColor || "#059669" },
                      ]}
                    >
                      <Text style={styles.avatarLetter}>{item.avatarLetter}</Text>
                    </View>

                    {/* Verified check badge on avatar corner */}
                    {item.verified && (
                      <View style={styles.verifiedBadgeCorner}>
                        <MaterialIcons name="check" size={10} color="#FFFFFF" />
                      </View>
                    )}
                  </View>

                  {/* Right Content Area */}
                  <View style={styles.cardContent}>
                    {/* Top Row: Name and Time / Unread Dot */}
                    <View style={styles.nameRow}>
                      <Text style={styles.senderName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <View style={styles.timeWrap}>
                        <Text style={styles.timeText}>{item.time}</Text>
                        {item.unread && <View style={styles.unreadDot} />}
                      </View>
                    </View>

                    {/* Property / Task Pin Row */}
                    <View style={styles.propertyRow}>
                      <MaterialIcons name="place" size={13} color="#059669" />
                      <Text style={styles.propertyText} numberOfLines={1}>
                        {item.property}
                      </Text>
                    </View>

                    {/* Last message snippet & chevron */}
                    <View style={styles.snippetRow}>
                      <Text style={styles.snippetText} numberOfLines={1}>
                        {item.lastMsg}
                      </Text>
                      <MaterialIcons name="chevron-right" size={18} color="#94A3B8" />
                    </View>

                    {/* Tags Row */}
                    <View style={styles.tagsRow}>
                      {item.tag1 && (
                        <View
                          style={[
                            styles.tagPill,
                            {
                              backgroundColor: item.tag1.bg || "#ECFDF5",
                              borderColor: item.tag1.border || "#A7F3D0",
                            },
                          ]}
                        >
                          <MaterialIcons
                            name={item.tag1.icon}
                            size={12}
                            color={item.tag1.color || "#065F46"}
                          />
                          <Text
                            style={[
                              styles.tagText,
                              { color: item.tag1.color || "#065F46" },
                            ]}
                          >
                            {item.tag1.label}
                          </Text>
                        </View>
                      )}

                      {item.tag2 && (
                        <View
                          style={[
                            styles.tagPill,
                            {
                              backgroundColor: item.tag2.bg || "#ECFDF5",
                              borderColor: item.tag2.border || "#A7F3D0",
                            },
                          ]}
                        >
                          <MaterialIcons
                            name={item.tag2.icon}
                            size={12}
                            color={item.tag2.color || "#065F46"}
                          />
                          <Text
                            style={[
                              styles.tagText,
                              { color: item.tag2.color || "#065F46" },
                            ]}
                          >
                            {item.tag2.label}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* ================= 6. SORT SELECTION MODAL ================= */}
      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.sortModalBox}>
            <Text style={styles.sortModalTitle}>Sort Messages</Text>

            <TouchableOpacity
              style={[
                styles.sortOptionRow,
                sortOption === "latest" && styles.sortOptionRowActive,
              ]}
              onPress={() => {
                setSortOption("latest");
                setShowSortModal(false);
              }}
            >
              <MaterialIcons
                name="schedule"
                size={18}
                color={sortOption === "latest" ? "#065F46" : "#64748B"}
              />
              <Text
                style={[
                  styles.sortOptionText,
                  sortOption === "latest" && styles.sortOptionTextActive,
                ]}
              >
                Latest First
              </Text>
              {sortOption === "latest" && (
                <MaterialIcons name="check" size={18} color="#065F46" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sortOptionRow,
                sortOption === "oldest" && styles.sortOptionRowActive,
              ]}
              onPress={() => {
                setSortOption("oldest");
                setShowSortModal(false);
              }}
            >
              <MaterialIcons
                name="history"
                size={18}
                color={sortOption === "oldest" ? "#065F46" : "#64748B"}
              />
              <Text
                style={[
                  styles.sortOptionText,
                  sortOption === "oldest" && styles.sortOptionTextActive,
                ]}
              >
                Oldest First
              </Text>
              {sortOption === "oldest" && (
                <MaterialIcons name="check" size={18} color="#065F46" />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ================= 7. INTERACTIVE CHAT SCREEN MODAL ================= */}
      {selectedChat && (
        <Modal
          visible={true}
          animationType="slide"
          onRequestClose={() => setSelectedChat(null)}
        >
          <KeyboardAvoidingView
            style={styles.chatModalContainer}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            {/* Chat Top Bar */}
            <View style={styles.chatHeader}>
              <TouchableOpacity
                style={styles.chatBackBtn}
                onPress={() => setSelectedChat(null)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="arrow-back" size={22} color="#0F172A" />
              </TouchableOpacity>

              <View
                style={[
                  styles.chatHeaderAvatar,
                  { backgroundColor: selectedChat.avatarColor || "#059669" },
                ]}
              >
                <Text style={styles.chatHeaderAvatarText}>
                  {selectedChat.avatarLetter}
                </Text>
              </View>

              <View style={styles.chatHeaderInfo}>
                <Text style={styles.chatHeaderName} numberOfLines={1}>
                  {selectedChat.name}
                </Text>
                <Text style={styles.chatHeaderProp} numberOfLines={1}>
                  {selectedChat.property}
                </Text>
              </View>

              {/* OTP Protected Badge */}
              <View style={styles.otpHeaderBadge}>
                <MaterialIcons name="shield" size={13} color="#059669" />
                <Text style={styles.otpHeaderBadgeText}>OTP Verified</Text>
              </View>
            </View>

            {/* Messages Scroll View */}
            <ScrollView
              style={styles.chatScrollView}
              contentContainerStyle={styles.chatScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Security notice banner */}
              <View style={styles.chatSecurityBanner}>
                <MaterialIcons name="lock" size={14} color="#059669" />
                <Text style={styles.chatSecurityBannerText}>
                  End-to-end verified deal communication with OTP protection.
                </Text>
              </View>

              {selectedChat.messages.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.msgWrapper,
                    msg.sender === "me" ? styles.msgWrapperMe : styles.msgWrapperThem,
                  ]}
                >
                  <View
                    style={[
                      styles.msgBubble,
                      msg.sender === "me" ? styles.msgBubbleMe : styles.msgBubbleThem,
                    ]}
                  >
                    <Text
                      style={[
                        styles.msgText,
                        msg.sender === "me" ? styles.msgTextMe : styles.msgTextThem,
                      ]}
                    >
                      {msg.text}
                    </Text>

                    {/* Attachment preview if present */}
                    {msg.attachment && (
                      <View style={styles.attachmentCard}>
                        <View style={styles.attachmentIconBox}>
                          <MaterialIcons
                            name={
                              msg.attachment.type === "offer"
                                ? "payments"
                                : "description"
                            }
                            size={18}
                            color="#059669"
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.attachmentTitle} numberOfLines={1}>
                            {msg.attachment.title}
                          </Text>
                          {msg.attachment.size && (
                            <Text style={styles.attachmentSize}>
                              {msg.attachment.size}
                            </Text>
                          )}
                        </View>
                        <TouchableOpacity style={styles.attachmentDownloadBtn} activeOpacity={0.7}>
                          <MaterialIcons name="file-download" size={16} color="#065F46" />
                        </TouchableOpacity>
                      </View>
                    )}

                    <Text
                      style={[
                        styles.msgTime,
                        msg.sender === "me" ? styles.msgTimeMe : styles.msgTimeThem,
                      ]}
                    >
                      {msg.time}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Chat Composer Input Row */}
            <View style={styles.chatComposer}>
              <TouchableOpacity style={styles.composerAttachBtn} activeOpacity={0.7}>
                <MaterialIcons name="attach-file" size={20} color="#64748B" />
              </TouchableOpacity>

              <TextInput
                style={styles.composerInput}
                placeholder="Type your message..."
                placeholderTextColor="#94A3B8"
                value={replyText}
                onChangeText={setReplyText}
                multiline
              />

              <TouchableOpacity
                style={[
                  styles.composerSendBtn,
                  !replyText.trim() && styles.composerSendBtnDisabled,
                ]}
                onPress={handleSendMessage}
                disabled={!replyText.trim()}
                activeOpacity={0.8}
              >
                <MaterialIcons name="send" size={17} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContainer: {
    paddingBottom: 24,
  },

  /* ================= HERO BANNER (TOP CONTAINER) ================= */
  heroContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    minHeight: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255, 255, 255, 0.42)",
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    zIndex: 2,
  },
  heroTitlesWrap: {
    flex: 1,
    paddingRight: 8,
  },
  heroCategoryLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#475569",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  heroHeadline: {
    fontSize: 21,
    fontWeight: "900",
    color: "#0F172A",
    lineHeight: 26,
    letterSpacing: -0.4,
    marginTop: 4,
  },
  heroSubtitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#334155",
    lineHeight: 15,
    marginTop: 4,
  },
  heroCursiveWrap: {
    alignItems: "flex-end",
    paddingTop: 2,
  },
  heroCursiveText: {
    fontFamily: Platform.OS === "web" ? "Caveat, Kalam, 'Segoe Script', cursive" : "System",
    fontSize: 13,
    color: "#166534",
    fontStyle: "italic",
    textAlign: "right",
    lineHeight: 16,
    transform: [{ rotate: "-4deg" }],
    fontWeight: "700",
  },
  heroPillsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    zIndex: 2,
  },
  heroPill: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  heroPillIconBox: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: "#E6F4EA",
    justifyContent: "center",
    alignItems: "center",
  },
  heroPillTextWrap: {
    flex: 1,
  },
  heroPillTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0F172A",
  },
  heroPillSub: {
    fontSize: 8.5,
    color: "#475569",
    fontWeight: "600",
    marginTop: 1,
  },

  /* ================= SEARCH & SORT ROW ================= */
  searchSortRow: {
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchBar: {
    flex: 1,
    height: 42,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: "#0F172A",
    outlineStyle: "none" as any,
  },
  sortButton: {
    height: 42,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },

  /* ================= SEGMENTED TABS ================= */
  tabsContainer: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: "#EEF2F6",
    borderRadius: 12,
    padding: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#475569",
  },
  tabTextActive: {
    color: "#065F46",
    fontWeight: "800",
  },
  unreadTabContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  unreadBadge: {
    backgroundColor: "#A7F3D0",
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 9999,
  },
  unreadBadgeText: {
    color: "#065F46",
    fontSize: 11,
    fontWeight: "800",
  },

  /* ================= MESSAGE CARDS ================= */
  messagesList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarWrap: {
    position: "relative",
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLetter: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
  },
  verifiedBadgeCorner: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#059669",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  senderName: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0F172A",
    flex: 1,
    marginRight: 6,
  },
  timeWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#059669",
  },
  propertyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 3,
  },
  propertyText: {
    fontSize: 11.5,
    color: "#475569",
    fontWeight: "600",
    flex: 1,
  },
  snippetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 8,
  },
  snippetText: {
    fontSize: 12,
    color: "#334155",
    lineHeight: 16,
    flex: 1,
    marginRight: 6,
  },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  tagPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 10.5,
    fontWeight: "700",
  },

  /* Empty State */
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
    textAlign: "center",
  },

  /* ================= SORT MODAL ================= */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  sortModalBox: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sortModalTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 14,
  },
  sortOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 10,
  },
  sortOptionRowActive: {
    backgroundColor: "#E6F4EA",
  },
  sortOptionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    flex: 1,
  },
  sortOptionTextActive: {
    color: "#065F46",
    fontWeight: "800",
  },

  /* ================= CHAT MODAL ================= */
  chatModalContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "ios" ? 50 : 16,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    gap: 10,
  },
  chatBackBtn: {
    padding: 4,
  },
  chatHeaderAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  chatHeaderAvatarText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  chatHeaderProp: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 1,
  },
  otpHeaderBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  otpHeaderBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#065F46",
  },
  chatScrollView: {
    flex: 1,
  },
  chatScrollContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  chatSecurityBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  chatSecurityBannerText: {
    fontSize: 11,
    color: "#065F46",
    fontWeight: "600",
    flex: 1,
  },
  msgWrapper: {
    flexDirection: "row",
    width: "100%",
  },
  msgWrapperThem: {
    justifyContent: "flex-start",
  },
  msgWrapperMe: {
    justifyContent: "flex-end",
  },
  msgBubble: {
    maxWidth: "82%",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  msgBubbleThem: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderBottomLeftRadius: 4,
  },
  msgBubbleMe: {
    backgroundColor: "#0B4D3C",
    borderBottomRightRadius: 4,
  },
  msgText: {
    fontSize: 13,
    lineHeight: 18,
  },
  msgTextThem: {
    color: "#0F172A",
  },
  msgTextMe: {
    color: "#FFFFFF",
  },
  msgTime: {
    fontSize: 9.5,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  msgTimeThem: {
    color: "#94A3B8",
  },
  msgTimeMe: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  attachmentCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  attachmentIconBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#E6F4EA",
    justifyContent: "center",
    alignItems: "center",
  },
  attachmentTitle: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#0F172A",
  },
  attachmentSize: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 1,
  },
  attachmentDownloadBtn: {
    padding: 6,
  },
  chatComposer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    gap: 8,
    paddingBottom: Platform.OS === "ios" ? 30 : 12,
  },
  composerAttachBtn: {
    padding: 6,
  },
  composerInput: {
    flex: 1,
    maxHeight: 90,
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: "#0F172A",
    outlineStyle: "none" as any,
  },
  composerSendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
  },
  composerSendBtnDisabled: {
    backgroundColor: "#CBD5E1",
  },
});
